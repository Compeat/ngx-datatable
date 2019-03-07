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
var utils_1 = require("../../utils");
var DataTableBodySectionHeaderComponent = /** @class */ (function () {
    function DataTableBodySectionHeaderComponent(element) {
        this.activate = new core_1.EventEmitter();
        this.element = element.nativeElement;
    }
    Object.defineProperty(DataTableBodySectionHeaderComponent.prototype, "columns", {
        get: function () {
            return this._columns;
        },
        set: function (val) {
            this._columns = val;
            this._calculatedWidth = utils_1.columnsTotalWidth(val);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataTableBodySectionHeaderComponent.prototype, "cssClass", {
        get: function () {
            var cls = 'datatable-body-row';
            if (this.isSelected)
                cls += ' active';
            if (this.rowIndex % 2 !== 0)
                cls += ' datatable-row-odd';
            if (this.rowIndex % 2 === 0)
                cls += ' datatable-row-even';
            if (this.rowClass) {
                var res = this.rowClass(this.row);
                if (typeof res === 'string') {
                    cls += " " + res;
                }
                else if (typeof res === 'object') {
                    var keys = Object.keys(res);
                    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                        var k = keys_1[_i];
                        if (res[k] === true)
                            cls += " " + k;
                    }
                }
            }
            return cls;
        },
        enumerable: true,
        configurable: true
    });
    DataTableBodySectionHeaderComponent.prototype.onClick = function (event) {
        this.activate.emit({
            type: 'click',
            event: event,
            row: this.row,
            rowElement: this.element
        });
    };
    DataTableBodySectionHeaderComponent.prototype.onDblClick = function (event) {
        this.activate.emit({
            type: 'dblclick',
            event: event,
            row: this.row,
            rowElement: this.element
        });
    };
    DataTableBodySectionHeaderComponent.prototype.onKeyDown = function (event) {
        var code = event.key || event.code;
        var isTargetRow = event.target === this.element;
        var isAction = code === utils_1.Codes.return ||
            code === utils_1.Codes.down ||
            code === utils_1.Codes.up ||
            code === utils_1.Codes.left ||
            code === utils_1.Codes.right;
        if (isAction && isTargetRow) {
            event.preventDefault();
            event.stopPropagation();
            this.activate.emit({
                type: 'keydown',
                event: event,
                row: this.row,
                rowElement: this.element
            });
        }
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array),
        __metadata("design:paramtypes", [Array])
    ], DataTableBodySectionHeaderComponent.prototype, "columns", null);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], DataTableBodySectionHeaderComponent.prototype, "expanded", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], DataTableBodySectionHeaderComponent.prototype, "rowClass", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], DataTableBodySectionHeaderComponent.prototype, "row", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], DataTableBodySectionHeaderComponent.prototype, "isSelected", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Number)
    ], DataTableBodySectionHeaderComponent.prototype, "rowIndex", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Number)
    ], DataTableBodySectionHeaderComponent.prototype, "sectionCount", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", core_1.TemplateRef)
    ], DataTableBodySectionHeaderComponent.prototype, "sectionHeaderTemplate", void 0);
    __decorate([
        core_1.HostBinding('class'),
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [])
    ], DataTableBodySectionHeaderComponent.prototype, "cssClass", null);
    __decorate([
        core_1.HostBinding('style.height.px'),
        core_1.Input(),
        __metadata("design:type", Number)
    ], DataTableBodySectionHeaderComponent.prototype, "sectionHeaderHeight", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], DataTableBodySectionHeaderComponent.prototype, "activate", void 0);
    __decorate([
        core_1.HostBinding('style.width.px'),
        __metadata("design:type", Number)
    ], DataTableBodySectionHeaderComponent.prototype, "_calculatedWidth", void 0);
    __decorate([
        core_1.HostListener('click', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [MouseEvent]),
        __metadata("design:returntype", void 0)
    ], DataTableBodySectionHeaderComponent.prototype, "onClick", null);
    __decorate([
        core_1.HostListener('dblclick', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [MouseEvent]),
        __metadata("design:returntype", void 0)
    ], DataTableBodySectionHeaderComponent.prototype, "onDblClick", null);
    __decorate([
        core_1.HostListener('keydown', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [KeyboardEvent]),
        __metadata("design:returntype", void 0)
    ], DataTableBodySectionHeaderComponent.prototype, "onKeyDown", null);
    DataTableBodySectionHeaderComponent = __decorate([
        core_1.Component({
            selector: 'datatable-body-section-header',
            template: "\n    <ng-template\n      *ngIf=\"sectionHeaderTemplate\"\n      [ngTemplateOutlet]=\"sectionHeaderTemplate.template\"\n      [ngTemplateOutletContext]=\"{\n        section: row,\n        expanded: expanded,\n        isSelected: isSelected,\n        sectionCount: sectionCount\n      }\">\n    </ng-template>\n    <div *ngIf=\"!sectionHeaderTemplate\">\n      {{row.title}}\n    </div>\n  ",
            changeDetection: core_1.ChangeDetectionStrategy.OnPush,
        }),
        __metadata("design:paramtypes", [core_1.ElementRef])
    ], DataTableBodySectionHeaderComponent);
    return DataTableBodySectionHeaderComponent;
}());
exports.DataTableBodySectionHeaderComponent = DataTableBodySectionHeaderComponent;
//# sourceMappingURL=body-section-header.component.js.map