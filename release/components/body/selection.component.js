"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var types_1 = require("../../types");
var DataTableSelectionComponent = /** @class */ (function () {
    function DataTableSelectionComponent() {
        this.activate = new core_1.EventEmitter();
        this.activateCell = new core_1.EventEmitter();
        this.select = new core_1.EventEmitter();
        this.getCellActive = this.getCellActive.bind(this);
        this.getRowActive = this.getRowActive.bind(this);
    }
    Object.defineProperty(DataTableSelectionComponent.prototype, "activated", {
        get: function () {
            return this._activated;
        },
        set: function (val) {
            this._activated = val;
            this.activateCell.emit(val);
        },
        enumerable: true,
        configurable: true
    });
    DataTableSelectionComponent.prototype.getNextRow = function (rows, index, direction) {
        return rows[Math.min(Math.max(index + direction, 0), rows.length - 1)];
    };
    DataTableSelectionComponent.prototype.activateRow = function (row, columnIndex, event) {
        var _this = this;
        var upRow = row;
        var newRow = row;
        var downRow = row;
        var nextColumn = columnIndex;
        var filteredRows = this.rows.filter(function (t) {
            return !t.$$isSectionHeader || (t.$isSectionHeader && t.$$sectionIndex === row.$$sectionIndex);
        });
        var rowId = !row.$$isSectionHeader ? this.rowIdentity(row) : row.$$sectionIndex;
        var rowIndex = !row.$$isSectionHeader ?
            filteredRows.findIndex(function (t) { return _this.rowIdentity(t) === rowId; }) :
            filteredRows.findIndex(function (t) { return t.$$sectionIndex === rowId; });
        if (event) {
            var code = event.key || event.code;
            if (code === utils_1.Codes.up) {
                newRow = this.getNextRow(filteredRows, rowIndex, -1);
            }
            else if (code === utils_1.Codes.down || code === utils_1.Codes.return) {
                newRow = this.getNextRow(filteredRows, rowIndex, 1);
            }
            else if (code === utils_1.Codes.left || (event.shiftKey && code === utils_1.Codes.tab)) {
                nextColumn = Math.max(columnIndex - 1, 0);
            }
            else if (code === utils_1.Codes.right || code === utils_1.Codes.tab) {
                nextColumn = Math.min(columnIndex + 1, this.columns.length - 1);
            }
        }
        var newRowId = this.rowIdentity(newRow);
        var newIndex = filteredRows.findIndex(function (t) { return _this.rowIdentity(t) === newRowId; });
        upRow = this.getNextRow(filteredRows, newIndex, -1);
        downRow = this.getNextRow(filteredRows, newIndex, 1);
        if (this.activated.$$isDefault) {
            this.activated.row = this.rowIdentity(newRow);
            this.activated.column = nextColumn;
            this.activateCell.emit(this.activated);
        }
        return { newRow: newRow, upRow: upRow, downRow: downRow, nextColumn: nextColumn };
    };
    DataTableSelectionComponent.prototype.selectRow = function (event, index, row) {
        var _a;
        if (!this.selectEnabled || row.$$isSectionHeader)
            return;
        var chkbox = this.selectionType === types_1.SelectionType.checkbox;
        var multi = this.selectionType === types_1.SelectionType.multi;
        var multiClick = this.selectionType === types_1.SelectionType.multiClick;
        var selected = [];
        if (multi || chkbox || multiClick) {
            if (event.shiftKey) {
                selected = utils_1.selectRowsBetween([], this.rows, index, this.prevIndex, this.getRowSelectedIdx.bind(this));
            }
            else if (event.ctrlKey || event.metaKey || multiClick || chkbox) {
                selected = utils_1.selectRows(this.selected.slice(), row, this.getRowSelectedIdx.bind(this));
            }
            else {
                selected = utils_1.selectRows([], row, this.getRowSelectedIdx.bind(this));
            }
        }
        else {
            selected = utils_1.selectRows([], row, this.getRowSelectedIdx.bind(this));
        }
        if (typeof this.selectCheck === 'function') {
            selected = selected.filter(this.selectCheck.bind(this));
        }
        this.selected.splice(0, this.selected.length);
        (_a = this.selected).push.apply(_a, selected);
        this.prevIndex = index;
        this.select.emit({
            selected: selected
        });
    };
    DataTableSelectionComponent.prototype.onActivate = function (model, index) {
        var type = model.type, event = model.event, row = model.row;
        var chkbox = this.selectionType === types_1.SelectionType.checkbox;
        var select = (!chkbox && (type === 'click' || type === 'dblclick')) ||
            (chkbox && type === 'checkbox');
        var activated = { upRow: row, newRow: row, downRow: row, nextColumn: model.cellIndex };
        if (select) {
            this.selectRow(event, index, row);
            activated = this.activateRow(row, model.cellIndex);
        }
        else if (type === 'keydown') {
            var code = event.key || event.code;
            activated = this.activateRow(row, model.cellIndex, event);
            if (code === utils_1.Codes.return) {
                this.selectRow(event, index, row);
            }
            else {
                this.onKeyboardFocus(model);
            }
        }
        this.activate.emit(__assign({}, model, { row: activated.newRow, upRow: activated.upRow, downRow: activated.downRow, column: this.columns[activated.nextColumn], cellIndex: activated.nextColumn }));
    };
    DataTableSelectionComponent.prototype.onKeyboardFocus = function (model) {
        var code = model.event.key || model.event.code;
        var shouldFocus = code === utils_1.Codes.up ||
            code === utils_1.Codes.down ||
            code === utils_1.Codes.right ||
            code === utils_1.Codes.left ||
            code === utils_1.Codes.tab;
        if (shouldFocus) {
            var isCellSelection = this.selectionType === types_1.SelectionType.cell;
            if (!model.cellElement || !isCellSelection) {
                this.focusRow(model.rowElement, code);
            }
            else if (isCellSelection) {
                this.focusCell(model.cellElement, model.rowElement, code, model.cellIndex);
            }
        }
    };
    DataTableSelectionComponent.prototype.focusRow = function (rowElement, code) {
        var nextRowElement = this.getPrevNextRow(rowElement, code);
        if (nextRowElement)
            nextRowElement.focus();
    };
    DataTableSelectionComponent.prototype.getPrevNextRow = function (rowElement, code) {
        var parentElement = rowElement.parentElement;
        if (parentElement) {
            var focusElement = void 0;
            if (code === utils_1.Codes.up) {
                focusElement = parentElement.previousElementSibling;
            }
            else if (code === utils_1.Codes.down) {
                focusElement = parentElement.nextElementSibling;
            }
            if (focusElement && focusElement.children.length) {
                return focusElement.children[0];
            }
        }
    };
    DataTableSelectionComponent.prototype.focusCell = function (cellElement, rowElement, code, cellIndex) {
        var nextCellElement;
        if (code === utils_1.Codes.left) {
            nextCellElement = cellElement.previousElementSibling;
        }
        else if (code === utils_1.Codes.right) {
            nextCellElement = cellElement.nextElementSibling;
        }
        else if (code === utils_1.Codes.up || code === utils_1.Codes.down) {
            var nextRowElement = this.getPrevNextRow(rowElement, code);
            if (nextRowElement) {
                var children = nextRowElement.getElementsByClassName('datatable-body-cell');
                if (children.length)
                    nextCellElement = children[cellIndex];
            }
        }
        if (nextCellElement)
            nextCellElement.focus();
    };
    DataTableSelectionComponent.prototype.getRowSelected = function (row) {
        if (this.selectionType == types_1.SelectionType.cell) {
            return this.activated.row === this.rowIdentity(row);
        }
        return this.getRowSelectedIdx(row, this.selected) > -1;
    };
    DataTableSelectionComponent.prototype.getRowActive = function (row) {
        return this.activated.row === this.rowIdentity(row)
            && this.selectionType !== types_1.SelectionType.cell;
    };
    DataTableSelectionComponent.prototype.getCellActive = function (row, columnIndex) {
        return this.activated.row === this.rowIdentity(row)
            && columnIndex === this.activated.column
            && this.selectionType === types_1.SelectionType.cell;
    };
    DataTableSelectionComponent.prototype.getRowSelectedIdx = function (row, selected) {
        var _this = this;
        if (!selected || !selected.length)
            return -1;
        var rowId = this.rowIdentity(row);
        return selected.findIndex(function (r) {
            var id = _this.rowIdentity(r);
            return id === rowId;
        });
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], DataTableSelectionComponent.prototype, "rows", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], DataTableSelectionComponent.prototype, "columns", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], DataTableSelectionComponent.prototype, "selected", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], DataTableSelectionComponent.prototype, "selectEnabled", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], DataTableSelectionComponent.prototype, "selectionType", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], DataTableSelectionComponent.prototype, "rowIdentity", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], DataTableSelectionComponent.prototype, "selectCheck", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [Object])
    ], DataTableSelectionComponent.prototype, "activated", null);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], DataTableSelectionComponent.prototype, "activate", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], DataTableSelectionComponent.prototype, "activateCell", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], DataTableSelectionComponent.prototype, "select", void 0);
    DataTableSelectionComponent = __decorate([
        core_1.Component({
            selector: 'datatable-selection',
            template: "\n    <ng-content></ng-content>\n  ",
            changeDetection: core_1.ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [])
    ], DataTableSelectionComponent);
    return DataTableSelectionComponent;
}());
exports.DataTableSelectionComponent = DataTableSelectionComponent;
//# sourceMappingURL=selection.component.js.map