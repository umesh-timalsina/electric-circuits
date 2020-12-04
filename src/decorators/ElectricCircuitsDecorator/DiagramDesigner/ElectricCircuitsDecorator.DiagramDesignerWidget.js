/*globals define, _, $*/

/**
 * Generated by DecoratorGenerator
 */

define([
    'js/Constants',
    'js/NodePropertyNames',
    'js/Widgets/DiagramDesigner/DiagramDesignerWidget.DecoratorBase',
    '../Core/ElectricCircuitDecorator.Core',
    '../Core/ElectricCircuits.META',
    'js/Widgets/DiagramDesigner/DiagramDesignerWidget.Constants',
    'css!./ElectricCircuitsDecorator.DiagramDesignerWidget.css'
], function (
    CONSTANTS,
    nodePropertyNames,
    DiagramDesignerWidgetDecoratorBase,
    ElectriCircuitsDecoratorCore,
    ElectricCircuitsMETA,
    DiagramDesignerWidgetConstants
) {

    'use strict';

    const DECORATOR_ID = 'ElectricCircuitsDecorator';

    function ElectricCircuitsDecorator(options) {
        const opts = _.extend({}, options);

        DiagramDesignerWidgetDecoratorBase.apply(this, [opts]);
        this._initializeDecorator({'connectors': true});

        this.name = '';

        this.logger.debug('ElectricCircuitsDecorator ctor');
    }

    _.extend(ElectricCircuitsDecorator.prototype, DiagramDesignerWidgetDecoratorBase.prototype);
    _.extend(ElectricCircuitsDecorator.prototype, ElectriCircuitsDecoratorCore.prototype);
    ElectricCircuitsDecorator.prototype.DECORATORID = DECORATOR_ID;


    /**
     * Called when a new element is added to the widget
     */
    ElectricCircuitsDecorator.prototype.on_addTo = function () {
        this._renderContent();
    };

    ElectricCircuitsDecorator.prototype.showSourceConnectors = function (params) {
        this.$sourceConnectors.show();
    };

    ElectricCircuitsDecorator.prototype.showEndConnectors = function (params) {
        this.$endConnectors.show();
    };

    ElectricCircuitsDecorator.prototype.hideSourceConnectors = function () {
        this.$sourceConnectors.hide();
    };

    ElectricCircuitsDecorator.prototype.hideEndConnectors = function () {
        this.$endConnectors.hide();
    };


    ElectricCircuitsDecorator.prototype.initializeConnectors = function () {
        this.$sourceConnectors = this.$el.find('.' + DiagramDesignerWidgetConstants.CONNECTOR_CLASS);
        this.$endConnectors = this.$el.find('.' + DiagramDesignerWidgetConstants.CONNECTOR_CLASS);

        this.hideSourceConnectors();
        this.hideEndConnectors();
    };

    ElectricCircuitsDecorator.prototype._registerForNotification = function (portId) {
        const partId = this._metaInfo[CONSTANTS.GME_ID];
        this._control.registerComponentIDForPartID(portId, partId);
    };

    ElectricCircuitsDecorator.prototype._unregisterForNotification = function (portId) {
        const partId = this._metaInfo[CONSTANTS.GME_ID];
        this._control.unregisterComponentIDForPartID(portId, partId);
    };

    ElectricCircuitsDecorator.prototype.notifyComponentEvent = function (componentList) {
        this.update();
    };

    return ElectricCircuitsDecorator;
});
