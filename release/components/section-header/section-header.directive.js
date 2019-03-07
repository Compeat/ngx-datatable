"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var section_header_template_directive_1 = require("./section-header-template.directive");
var DatatableSectionHeaderDirective = /** @class */ (function () {
    function DatatableSectionHeaderDirective() {
        /**
         * Height of the header.
         * This is required especially when virtual scroll is enabled.
         *
         * @type {number|function(row?:any,index?:number): number}
         * @memberOf DatatableSectionHeaderDirective
         */
        this.height = 0;
        /**
         * Section visbility was toggled.
         *
         * @type {EventEmitter<any>}
         * @memberOf DatatableSectionDirective
         */
        this.toggle = new core_1.EventEmitter();
    }
    /**
     * Toggle the expansion of the section
     *
     * @param section
     * @memberOf DatatableSectionDirective
     */
    DatatableSectionHeaderDirective.prototype.toggleExpandSection = function (section) {
        this.toggle.emit({
            type: 'section',
            value: section
        });
    };
    /**
     * API method to expand all the sections.
     *
     * @memberOf DatatableSectionDirective
     */
    DatatableSectionHeaderDirective.prototype.expandAllSections = function () {
        this.toggle.emit({
            type: 'all',
            value: true
        });
    };
    /**
     * API method to collapse all the sections.
     *
     * @memberOf DatatableSectionDirective
     */
    DatatableSectionHeaderDirective.prototype.collapseAllSections = function () {
        this.toggle.emit({
            type: 'all',
            value: false
        });
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], DatatableSectionHeaderDirective.prototype, "height", void 0);
    __decorate([
        core_1.Input(),
        core_1.ContentChild(section_header_template_directive_1.DatatableSectionHeaderTemplateDirective, { read: core_1.TemplateRef }),
        __metadata("design:type", core_1.TemplateRef)
    ], DatatableSectionHeaderDirective.prototype, "template", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], DatatableSectionHeaderDirective.prototype, "toggle", void 0);
    DatatableSectionHeaderDirective = __decorate([
        core_1.Directive({ selector: 'ngx-datatable-section-header' })
    ], DatatableSectionHeaderDirective);
    return DatatableSectionHeaderDirective;
}());
exports.DatatableSectionHeaderDirective = DatatableSectionHeaderDirective;
//# sourceMappingURL=section-header.directive.js.map