/*globals define, WebGMEGlobal*/
define([
    'js/Constants',
    'js/Utils/GMEConcepts',
    'js/NodePropertyNames',
    'q',
    'blob/BlobClient',
    './ElectricCircuitEditorControl.Joint',
], function (
    CONSTANTS,
    GMEConcepts,
    nodePropertyNames,
    Q,
    BlobClient,
    JointControl,
) {

    'use strict';

    const RECOMMENDATION_PLUGIN = 'RecommendNextComponents';

    class ElectricCircuitsEditorControl extends JointControl {
        constructor(options) {
            super(options.client);

            this._logger = options.logger.fork('Control');
            this._client = options.client;

            this._widget = options.widget;

            this._blobClient = new BlobClient({
                logger: this._logger.fork('BlobClient')
            });

            this._currentNodeId = null;

            this._initWidgetEventHandlers();
            this._shouldRequestLayout = true;

            this._logger.debug('ctor finished');
        }

        _initWidgetEventHandlers() {
            this._widget.onNodeAttributeChanged = this.onNodeAttributeChanged.bind(this);
            this._widget.runRecommendationPlugin = this.runRecommendationPlugin.bind(this);
            this._widget.getRecommendationPluginMetadata = this.getRecommendationPluginMetadata;
            this._widget.onNodeCreated = this.createNodes.bind(this);
            this._widget.getValidComponents = this.getValidPartBrowserNodes.bind(this);
            this._widget.changeActiveObject = this.changeActiveObject.bind(this);
            this._widget.canBeActiveObject = this.canBeActiveObject.bind(this);
            this._widget.showParent = this.showParent.bind(this);
            this._widget.isNestedDisplay = this.isNestedDisplay.bind(this);
            this._widget.getParentName = this.getParentName.bind(this);
            this._widget.addWires = this.addWires.bind(this);
            this._widget.onRecommendedNodeAdded = this.createNodes.bind(this);
        }

        onNodeAttributeChanged(nodeId, attrs) {
            Object.keys(attrs).forEach(name => {
                this._client.startTransaction(`About to change attribute ${name} of node ${nodeId}`);
                this._client.setAttribute(nodeId, name, attrs[name]);
                this._client.completeTransaction(`Set attribute ${name} of node ${nodeId} to ${attrs[name]}`, null);
            });
        }

        async runRecommendationPlugin(pluginConfig) {
            const pluginName = RECOMMENDATION_PLUGIN;
            const pluginContext = this._client.getCurrentPluginContext();
            pluginContext.pluginConfig = pluginConfig;
            const pluginResults = await Q.ninvoke(
                this._client,
                'runServerPlugin',
                pluginName,
                pluginContext
            );

            if (pluginResults.artifacts) {
                return this._blobClient.getObjectAsJSON(pluginResults.artifacts.pop());
            }
        }

        getRecommendationPluginMetadata() {
            return WebGMEGlobal.allPluginsMetadata[RECOMMENDATION_PLUGIN];
        }

        createNodes(nodeOrNodes, shouldRequestLayout=true) {
            let nodesArr = nodeOrNodes;
            let createNodeIds = [];
            if (!Array.isArray(nodeOrNodes)){
                nodesArr = [nodeOrNodes];
            }
            this._client.startTransaction('About to create multiple nodes; ');
            nodesArr.forEach(node => {
                const nodeId = this._client.createNode({
                    baseId: this.META_NAMES[node.type],
                    parentId: this._currentNodeId
                }, {
                    registry: {
                        position: node.position ? node.position : {x: 0, y: 0},
                    }
                }, ` created node of type ${node.type}`);

                createNodeIds.push(nodeId);
            });
            this._client.completeTransaction('Completed nodes creation');
            this._shouldRequestLayout = shouldRequestLayout;

            return Array.isArray(nodeOrNodes) ? createNodeIds : createNodeIds.pop();
        }

        addWires(nodeId, wires, shouldRequestLayout=true) {
            const wireIds = [];
            this._shouldRequestLayout = shouldRequestLayout;
            this._client.startTransaction('About to create wires; ');
            Object.keys(wires).forEach(pin => {
                const wireId = this._client.createNode({
                    baseId: this.META_NAMES['Wire'],
                    parentId: this._currentNodeId,
                }, {}, `Created wire in the current circuit with id ${this._currentNodeId}`);
                wireIds.push(wireId);
                this._client.setPointer(wireId, 'src', pin);
                this._client.setPointer(wireId, 'dst',  wires[pin].port || wires[pin].id);
            });
            this._client.completeTransaction(`Finished creating wires with ids ${wireIds}`);
        }

        selectedObjectChanged(nodeId) {
            let self = this;

            // Remove current territory patterns
            if (self._currentNodeId) {
                self._client.removeUI(self._territoryId);
            }

            self._currentNodeId = nodeId;
            self._currentNodeParentId = undefined;

            if (typeof self._currentNodeId === 'string') {
                // Put new node's info into territory rules
                self._selfPatterns = {};
                self._selfPatterns[nodeId] = {children: 3};  // Territory "rule"

                self._widget.setTitle('');

                self._territoryId = self._client.addUI(self, function (events) {
                    self._eventCallback(events);
                });

                // Update the territory
                self._client.updateTerritory(self._territoryId, self._selfPatterns);

                self._selfPatterns[nodeId] = {children: 3};
                self._client.updateTerritory(self._territoryId, self._selfPatterns);
            }
        }

        _getObjectDescriptor(nodeId) {
            if (this.isCircuit(nodeId) && !this.isSubCircuit(nodeId)) {
                return;
            }
            if (this.isPin(nodeId) && !this.isCircuitPin(nodeId)) {
                return;
            }
            if (this.isInsideCCSource(nodeId) || this.isInsideSubCircuit(nodeId)) {
                return;
            }
            return this.toJointJSON(nodeId);
        }

        _eventCallback(events) {
            var i = events ? events.length : 0,
                event;
            this._logger.debug('_eventCallback \'' + i + '\' items');
            while (i--) {
                event = events[i];
                switch (event.etype) {
                case CONSTANTS.TERRITORY_EVENT_LOAD:
                    this._onLoad(event.eid);
                    break;
                case CONSTANTS.TERRITORY_EVENT_UPDATE:
                    this._onUpdate(event.eid);
                    break;
                case CONSTANTS.TERRITORY_EVENT_UNLOAD:
                    this._onUnload(event.eid);
                    break;
                default:
                    break;
                }
            }
            if (events && this._shouldRequestLayout) {
                this._widget.requestLayout();
            }
            this._logger.debug('_eventCallback \'' + events.length + '\' items - DONE');
        }

        _onLoad(gmeId) {
            const desc = this._getObjectDescriptor(gmeId);
            if (desc) {
                this._widget.addNode(desc);
            }
            if (this.isCircuit(gmeId) && !this.isSubCircuit(gmeId)) {
                const name = this._client.getNode(gmeId).getAttribute('name');
                this._widget.setDashboardTitle(name);
            }
        }

        _onUpdate(gmeId) {
            const desc = this._getObjectDescriptor(gmeId);
            if (desc) {
                this._widget.updateNode(desc);
            }
            if (this.isCircuit(gmeId) && !this.isSubCircuit(gmeId)) {
                const name = this._client.getNode(gmeId).getAttribute('name');
                this._widget.setDashboardTitle(name);
            }
        }

        _onUnload(gmeId) {
            this._widget.removeNode(gmeId);
        }

        _stateActiveObjectChanged(model, activeObjectId) {
            if (this._currentNodeId === activeObjectId) {
                // The same node selected as before - do not trigger
            } else {
                this._widget.destroy();
                this.selectedObjectChanged(activeObjectId);
            }
        }

        /* * * * * * * * Visualizer life cycle callbacks * * * * * * * */
        destroy() {
            this._detachClientEventListeners();
            if (this._territoryId) {
                this._client.removeUI(this._territoryId);
            }
        }

        _attachClientEventListeners() {
            this._detachClientEventListeners();
            WebGMEGlobal.State.on('change:' + CONSTANTS.STATE_ACTIVE_OBJECT, this._stateActiveObjectChanged, this);
        }

        _detachClientEventListeners() {
            WebGMEGlobal.State.off('change:' + CONSTANTS.STATE_ACTIVE_OBJECT, this._stateActiveObjectChanged);
        }

        onActivate() {
            this._attachClientEventListeners();

            if (typeof this._currentNodeId === 'string') {
                WebGMEGlobal.State.registerActiveObject(this._currentNodeId, {suppressVisualizerFromNode: true});
            }
        }

        onDeactivate() {
            this._detachClientEventListeners();
        }
    }

    return ElectricCircuitsEditorControl;
});
