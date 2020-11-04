/*globals define, _, DEBUG, $*/
/*eslint-env browser*/

/**
 * Generated by DecoratorGenerator
 */


define([
    'js/Constants',
    'js/NodePropertyNames',
    'js/Widgets/PartBrowser/PartBrowserWidget.DecoratorBase',
    '../Core/ElectricCircuitDecorator.Core',
    'js/Widgets/DiagramDesigner/DiagramDesignerWidget.Constants',
    'css!../DiagramDesigner/ElectricCircuitsDecorator.DiagramDesignerWidget.css',
    'css!./ElectricCircuitsDecorator.PartBrowserWidget.css'
], function (CONSTANTS,
             nodePropertyNames,
             PartBrowserWidgetDecoratorBase,
             ElectricCircuitsDecoratorCore,
             DiagramDesignerWidgetConstants,
) {

    'use strict';

    var DECORATOR_ID = 'ElectricCircuitsDecoratorPartBrowserWidget';

    function ElectricCircuitsDecoratorPartBrowserWidget(options) {
        var opts = _.extend({}, options);

        PartBrowserWidgetDecoratorBase.apply(this, [opts]);

        this.logger.debug('ElectricCircuitsDecoratorPartBrowserWidget ctor');
    }

    _.extend(ElectricCircuitsDecoratorPartBrowserWidget.prototype, PartBrowserWidgetDecoratorBase.prototype);
    _.extend(ElectricCircuitsDecoratorPartBrowserWidget.prototype, ElectricCircuitsDecoratorCore.prototype);
    ElectricCircuitsDecoratorPartBrowserWidget.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DiagramDesignerWidgetDecoratorBase MEMBERS **************************/

    ElectricCircuitsDecoratorPartBrowserWidget.prototype.beforeAppend = function () {
        this.$el = this.$DOMBase.clone();

        this._renderContent();
    };

    ElectricCircuitsDecoratorPartBrowserWidget.prototype.afterAppend = function () {

    };

    /**** Override from ModelDecoratorCore ****/
    ElectricCircuitsDecoratorPartBrowserWidget.prototype._registerForNotification = function (portId) {
        var partId = this._metaInfo[CONSTANTS.GME_ID];

        this._control.registerComponentIDForPartID(portId, partId);
    };


    /**** Override from ModelDecoratorCore ****/
    ElectricCircuitsDecoratorCore.prototype._unregisterForNotification = function (portId) {
        var partId = this._metaInfo[CONSTANTS.GME_ID];

        this._control.unregisterComponentIDFromPartID(portId, partId);
    };

    return ElectricCircuitsDecoratorPartBrowserWidget;
});
