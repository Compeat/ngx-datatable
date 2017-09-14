"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var utils_1 = require("../../utils");
var scroller_component_1 = require("./scroller.component");
var DataTableBodyComponent = /** @class */ (function () {
    /**
     * Creates an instance of DataTableBodyComponent.
     *
     * @memberOf DataTableBodyComponent
     */
    function DataTableBodyComponent(cd) {
        var _this = this;
        this.cd = cd;
        this.selected = [];
        this.scroll = new core_1.EventEmitter();
        this.page = new core_1.EventEmitter();
        this.activate = new core_1.EventEmitter();
        this.activateCell = new core_1.EventEmitter();
        this.select = new core_1.EventEmitter();
        this.detailToggle = new core_1.EventEmitter();
        this.sectionHeaderToggle = new core_1.EventEmitter();
        this.rowContextmenu = new core_1.EventEmitter(false);
        this.rowHeightsCache = new utils_1.RowHeightCache();
        this.temp = [];
        this.offsetY = 0;
        this.indexes = {};
        this.rowIndexes = new Map();
        this.rowExpansions = new Map();
        /**
         * Get the height of the detail row.
         *
         * @param {*} [row]
         * @param {*} [index]
         * @returns {number}
         *
         * @memberOf DataTableBodyComponent
         */
        this.getDetailRowHeight = function (row, index) {
            if (!_this.rowDetail)
                return 0;
            var rowHeight = _this.rowDetail.rowHeight;
            return typeof rowHeight === 'function' ? rowHeight(row, index) : rowHeight;
        };
        /**
         * Get the height of the section header
         * @param section
         * @returns {number}
         *
         * @memberOf DataTableBodyComponent
         */
        this.getSectionHeaderHeight = function (section) {
            var height = _this.sectionHeader ? _this.sectionHeader.height : _this.sectionHeaderHeight;
            return typeof height === 'function' ? height(section) : height;
        };
        // declare fn here so we can get access to the `this` property
        this.rowTrackingFn = function (index, row) {
            var idx = this.rowIndexes.get(row);
            if (this.trackByProp) {
                return idx + "-" + this.trackByProp;
            }
            else {
                return idx;
            }
        }.bind(this);
    }
    Object.defineProperty(DataTableBodyComponent.prototype, "pageSize", {
        get: function () {
            return this._pageSize;
        },
        set: function (val) {
            this._pageSize = val;
            this.recalcLayout();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataTableBodyComponent.prototype, "rows", {
        get: function () {
            return this._rows;
        },
        set: function (val) {
            this._rows = val;
            this.rowExpansions.clear();
            this.recalcLayout();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataTableBodyComponent.prototype, "columns", {
        get: function () {
            return this._columns;
        },
        set: function (val) {
            this._columns = val;
            var colsByPin = utils_1.columnsByPin(val);
            this.columnGroupWidths = utils_1.columnGroupWidths(colsByPin, val);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataTableBodyComponent.prototype, "offset", {
        get: function () {
            return this._offset;
        },
        set: function (val) {
            this._offset = val;
            this.recalcLayout();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataTableBodyComponent.prototype, "rowCount", {
        get: function () {
            return this._rowCount;
        },
        set: function (val) {
            this._rowCount = val;
            this.recalcLayout();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataTableBodyComponent.prototype, "bodyWidth", {
        get: function () {
            if (this.scrollbarH) {
                return this.innerWidth + 'px';
            }
            else {
                return '100%';
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataTableBodyComponent.prototype, "bodyHeight", {
        get: function () {
            return this._bodyHeight;
        },
        set: function (val) {
            if (this.scrollbarV) {
                this._bodyHeight = val + 'px';
            }
            else {
                this._bodyHeight = 'auto';
            }
            this.recalcLayout();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataTableBodyComponent.prototype, "selectEnabled", {
        /**
         * Returns if selection is enabled.
         *
         * @readonly
         * @type {boolean}
         * @memberOf DataTableBodyComponent
         */
        get: function () {
            return !!this.selectionType;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataTableBodyComponent.prototype, "scrollHeight", {
        /**
         * Property that would calculate the height of scroll bar
         * based on the row heights cache for virtual scroll. Other scenarios
         * calculate scroll height automatically (as height will be undefined).
         *
         * @readonly
         * @type {number}
         * @memberOf DataTableBodyComponent
         */
        get: function () {
            if (this.scrollbarV) {
                return this.rowHeightsCache.query(this.rowCount - 1);
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Called after the constructor, initializing input properties
     *
     * @memberOf DataTableBodyComponent
     */
    DataTableBodyComponent.prototype.ngOnInit = function () {
        var _this = this;
        if (this.rowDetail) {
            this.rowDetailListener = this.rowDetail.toggle
                .subscribe(function (_a) {
                var type = _a.type, value = _a.value;
                if (type === 'row')
                    _this.toggleRowExpansion(value);
                if (type === 'all')
                    _this.toggleAllRows(value);
                // Refresh rows after toggle
                // Fixes #883
                _this.updateIndexes();
                _this.updateRows();
            });
        }
        if (this.sectionHeader) {
            this.sectionHeaderListener = this.sectionHeader.toggle
                .subscribe(function (_a) {
                var type = _a.type, value = _a.value;
                if (type === 'section')
                    _this.toggleSectionExpansion(value);
                if (type === 'all')
                    _this.toggleAllSections(value);
            });
        }
        this.activateListener = this.activate.subscribe(function () { _this.cd.markForCheck(); });
    };
    /**
     * Called once, before the instance is destroyed.
     *
     * @memberOf DataTableBodyComponent
     */
    DataTableBodyComponent.prototype.ngOnDestroy = function () {
        if (this.rowDetail)
            this.rowDetailListener.unsubscribe();
        if (this.sectionHeader)
            this.sectionHeaderListener.unsubscribe();
        if (this.activateListener)
            this.activateListener.unsubscribe();
    };
    /**
     * Updates the Y offset given a new offset.
     *
     * @param {number} [offset]
     *
     * @memberOf DataTableBodyComponent
     */
    DataTableBodyComponent.prototype.updateOffsetY = function (offset) {
        // scroller is missing on empty table
        if (!this.scroller)
            return;
        if (this.scrollbarV && offset) {
            // First get the row Index that we need to move to.
            var rowIndex = this.pageSize * offset;
            offset = this.rowHeightsCache.query(rowIndex - 1);
        }
        this.scroller.setOffset(offset || 0);
    };
    /**
     * Scrolls to the given row id. If the row is in a section the section must already be expanded.
     *
     * @param rowId
     */
    DataTableBodyComponent.prototype.scrollToRow = function (rowId) {
        var _this = this;
        if (this.scrollbarV) {
            // find row
            var rowIndex = this.rows.findIndex(function (r) {
                return _this.rowIdentity(r) === rowId;
            });
            var offset = this.rowHeightsCache.query(rowIndex - 1);
            this.scroller.setOffset(offset);
        }
    };
    /**
     * Scrolls to the section header of the given section.
     *
     * @param sectionId
     */
    DataTableBodyComponent.prototype.scrollToSection = function (sectionId) {
        if (this.scrollbarV && this.sections) {
            var rowIndex = this.rows.findIndex(function (r) {
                return r.$$isSectionHeader && r.$$sectionIndex === sectionId;
            });
            var offset = this.rowHeightsCache.query(rowIndex - 1);
            this.scroller.setOffset(offset);
        }
    };
    /**
     * Body was scrolled, this is mainly useful for
     * when a user is server-side pagination via virtual scroll.
     *
     * @param {*} event
     *
     * @memberOf DataTableBodyComponent
     */
    DataTableBodyComponent.prototype.onBodyScroll = function (event) {
        var scrollYPos = event.scrollYPos;
        var scrollXPos = event.scrollXPos;
        // if scroll change, trigger update
        // this is mainly used for header cell positions
        if (this.offsetY !== scrollYPos || this.offsetX !== scrollXPos) {
            this.scroll.emit({
                offsetY: scrollYPos,
                offsetX: scrollXPos
            });
        }
        this.offsetY = scrollYPos;
        this.offsetX = scrollXPos;
        this.updateIndexes();
        this.updatePage(event.direction);
        this.updateRows();
    };
    /**
     * Updates the page given a direction.
     *
     * @param {string} direction
     *
     * @memberOf DataTableBodyComponent
     */
    DataTableBodyComponent.prototype.updatePage = function (direction) {
        var offset = this.indexes.first / this.pageSize;
        if (direction === 'up') {
            offset = Math.ceil(offset);
        }
        else if (direction === 'down') {
            offset = Math.ceil(offset);
        }
        if (direction !== undefined && !isNaN(offset)) {
            this.page.emit({ offset: offset });
        }
    };
    /**
     * Updates the rows in the view port
     *
     * @memberOf DataTableBodyComponent
     */
    DataTableBodyComponent.prototype.updateRows = function () {
        var _a = this.indexes, first = _a.first, last = _a.last;
        var rowIndex = first;
        var idx = 0;
        var temp = [];
        this.rowIndexes.clear();
        while (rowIndex < last && rowIndex < this.rowCount) {
            var row = this.rows[rowIndex];
            if (row) {
                this.rowIndexes.set(row, rowIndex);
                temp[idx] = row;
            }
            idx++;
            rowIndex++;
        }
        this.temp = temp;
    };
    /**
     * Get the row height
     *
     * @param {*} row
     * @returns {number}
     *
     * @memberOf DataTableBodyComponent
     */
    DataTableBodyComponent.prototype.getRowHeight = function (row) {
        if (row.$$isSectionHeader) {
            return this.getSectionHeaderHeight(row);
        }
        return typeof this.rowHeight === 'function' ? this.rowHeight(row) : this.rowHeight;
    };
    /**
     * Calculate row height based on the expanded state of the row.
     *
     * @param {*} row the row for which the height need to be calculated.
     * @returns {number} height of the row.
     *
     * @memberOf DataTableBodyComponent
     */
    DataTableBodyComponent.prototype.getRowAndDetailHeight = function (row) {
        var rowHeight = this.getRowHeight(row);
        var expanded = this.rowExpansions.get(row);
        // Adding detail row height if its expanded.
        if (expanded === 1) {
            rowHeight += this.getDetailRowHeight(row);
        }
        return rowHeight;
    };
    /**
     * Calculates the styles for the row so that the rows can be moved in 2D space
     * during virtual scroll inside the DOM.   In the below case the Y position is
     * manipulated.   As an example, if the height of row 0 is 30 px and row 1 is
     * 100 px then following styles are generated:
     *
     * transform: translate3d(0px, 0px, 0px);    ->  row0
     * transform: translate3d(0px, 30px, 0px);   ->  row1
     * transform: translate3d(0px, 130px, 0px);  ->  row2
     *
     * Row heights have to be calculated based on the row heights cache as we wont
     * be able to determine which row is of what height before hand.  In the above
     * case the positionY of the translate3d for row2 would be the sum of all the
     * heights of the rows before it (i.e. row0 and row1).
     *
     * @param {*} row The row that needs to be placed in the 2D space.
     * @returns {*} Returns the CSS3 style to be applied
     *
     * @memberOf DataTableBodyComponent
     */
    DataTableBodyComponent.prototype.getRowsStyles = function (row) {
        var rowHeight = this.getRowAndDetailHeight(row);
        var styles = {
            height: rowHeight + 'px'
        };
        if (this.scrollbarV) {
            var idx = this.rowIndexes.get(row) || 0;
            // const pos = idx * rowHeight;
            // The position of this row would be the sum of all row heights
            // until the previous row position.
            var pos = this.rowHeightsCache.query(idx - 1);
            utils_1.translateXY(styles, 0, pos);
        }
        return styles;
    };
    /**
     * Hides the loading indicator
     *
     *
     * @memberOf DataTableBodyComponent
     */
    DataTableBodyComponent.prototype.hideIndicator = function () {
        var _this = this;
        setTimeout(function () { return _this.loadingIndicator = false; }, 500);
    };
    /**
     * Updates the index of the rows in the viewport
     *
     * @memberOf DataTableBodyComponent
     */
    DataTableBodyComponent.prototype.updateIndexes = function () {
        var first = 0;
        var last = 0;
        if (this.scrollbarV) {
            // Calculation of the first and last indexes will be based on where the
            // scrollY position would be at.  The last index would be the one
            // that shows up inside the view port the last.
            var height = parseInt(this.bodyHeight, 0);
            first = this.rowHeightsCache.getRowIndex(this.offsetY);
            last = this.rowHeightsCache.getRowIndex(height + this.offsetY) + 1;
        }
        else {
            // The server is handling paging and will pass an array that begins with the
            // element at a specified offset.  first should always be 0 with external paging.
            if (!this.externalPaging) {
                first = Math.max(this.offset * this.pageSize, 0);
            }
            last = Math.min((first + this.pageSize), this.rowCount);
        }
        this.indexes = { first: first, last: last };
    };
    /**
     * Refreshes the full Row Height cache.  Should be used
     * when the entire row array state has changed.
     *
     * @returns {void}
     *
     * @memberOf DataTableBodyComponent
     */
    DataTableBodyComponent.prototype.refreshRowHeightCache = function () {
        if (!this.scrollbarV)
            return;
        // clear the previous row height cache if already present.
        // this is useful during sorts, filters where the state of the
        // rows array is changed.
        this.rowHeightsCache.clearCache();
        // Initialize the tree only if there are rows inside the tree.
        if (this.rows && this.rows.length) {
            this.rowHeightsCache.initCache({
                rows: this.rows,
                rowHeight: this.rowHeight,
                sectionHeaderHeight: this.getSectionHeaderHeight,
                detailRowHeight: this.getDetailRowHeight,
                externalVirtual: this.scrollbarV && this.externalPaging,
                rowCount: this.rowCount,
                rowIndexes: this.rowIndexes,
                rowExpansions: this.rowExpansions
            });
        }
    };
    /**
     * Gets the index for the view port
     *
     * @returns {number}
     *
     * @memberOf DataTableBodyComponent
     */
    DataTableBodyComponent.prototype.getAdjustedViewPortIndex = function () {
        // Capture the row index of the first row that is visible on the viewport.
        // If the scroll bar is just below the row which is highlighted then make that as the
        // first index.
        var viewPortFirstRowIndex = this.indexes.first;
        if (this.scrollbarV) {
            var offsetScroll = this.rowHeightsCache.query(viewPortFirstRowIndex - 1);
            return offsetScroll <= this.offsetY ? viewPortFirstRowIndex - 1 : viewPortFirstRowIndex;
        }
        return viewPortFirstRowIndex;
    };
    /**
     * Toggle the Expansion of the row i.e. if the row is expanded then it will
     * collapse and vice versa.   Note that the expanded status is stored as
     * a part of the row object itself as we have to preserve the expanded row
     * status in case of sorting and filtering of the row set.
     *
     * @param {*} row The row for which the expansion needs to be toggled.
     *
     * @memberOf DataTableBodyComponent
     */
    DataTableBodyComponent.prototype.toggleRowExpansion = function (row) {
        // Capture the row index of the first row that is visible on the viewport.
        var viewPortFirstRowIndex = this.getAdjustedViewPortIndex();
        var expanded = this.rowExpansions.get(row);
        // If the detailRowHeight is auto --> only in case of non-virtualized scroll
        if (this.scrollbarV) {
            var detailRowHeight = this.getDetailRowHeight(row) * (expanded ? -1 : 1);
            var idx = this.rowIndexes.get(row) || 0;
            this.rowHeightsCache.update(idx, detailRowHeight);
        }
        // Update the toggled row and update thive nevere heights in the cache.
        expanded = expanded ^= 1;
        this.rowExpansions.set(row, expanded);
        this.detailToggle.emit({
            rows: [row],
            currentIndex: viewPortFirstRowIndex
        });
    };
    /**
     * Expand/Collapse all the rows no matter what their state is.
     *
     * @param {boolean} expanded When true, all rows are expanded and when false, all rows will be collapsed.
     *
     * @memberOf DataTableBodyComponent
     */
    DataTableBodyComponent.prototype.toggleAllRows = function (expanded) {
        // clear prev expansions
        this.rowExpansions.clear();
        var rowExpanded = expanded ? 1 : 0;
        // Capture the row index of the first row that is visible on the viewport.
        var viewPortFirstRowIndex = this.getAdjustedViewPortIndex();
        for (var _i = 0, _a = this.rows; _i < _a.length; _i++) {
            var row = _a[_i];
            this.rowExpansions.set(row, rowExpanded);
        }
        if (this.scrollbarV) {
            // Refresh the full row heights cache since every row was affected.
            this.recalcLayout();
        }
        // Emit all rows that have been expanded.
        this.detailToggle.emit({
            rows: this.rows,
            currentIndex: viewPortFirstRowIndex
        });
    };
    /**
     * Toggle the Expansion of the section i.e. if the section is expanded then it will
     * collapse and vice versa.
     *
     * @param {*} row The section header row for which the expansion needs to be toggled.
     *
     * @memberOf DataTableBodyComponent
     */
    DataTableBodyComponent.prototype.toggleSectionExpansion = function (section) {
        // Capture the row index of the first row that is visible on the viewport.
        var viewPortFirstRowIndex = this.getAdjustedViewPortIndex();
        var expanded = +this.sections[section].expanded;
        // Update the toggled row and update thive nevere heights in the cache.
        expanded = expanded ^= 1;
        this.sectionHeaderToggle.emit({
            sections: [section],
            currentIndex: viewPortFirstRowIndex
        });
    };
    /**
     * Expand/Collapse all the row sections no matter what their state is.
     *
     * @param {boolean} expanded When true, all sections are expanded and when false, all sections will be collapsed.
     *
     * @memberOf DataTableBodyComponent
     */
    DataTableBodyComponent.prototype.toggleAllSections = function (expanded) {
        // clear prev expansions
        this.rowExpansions.clear();
        var rowExpanded = expanded ? 1 : 0;
        // Capture the row index of the first row that is visible on the viewport.
        var viewPortFirstRowIndex = this.getAdjustedViewPortIndex();
        for (var _i = 0, _a = this.rows; _i < _a.length; _i++) {
            var row = _a[_i];
            this.rowExpansions.set(row, rowExpanded);
        }
        if (this.scrollbarV) {
            // Refresh the full row heights cache since every row was affected.
            this.recalcLayout();
        }
        // Emit all sections that have been expanded.
        // todo - this shouldn't include all rows, just header rows
        this.sectionHeaderToggle.emit({
            rows: this.rows,
            currentIndex: viewPortFirstRowIndex
        });
    };
    /**
     * Recalculates the table
     *
     * @memberOf DataTableBodyComponent
     */
    DataTableBodyComponent.prototype.recalcLayout = function () {
        this.refreshRowHeightCache();
        this.updateIndexes();
        this.updateRows();
    };
    /**
     * Returns if the row was expanded
     *
     * @param {*} row
     * @returns {boolean}
     * @memberof DataTableBodyComponent
     */
    DataTableBodyComponent.prototype.getRowExpanded = function (row) {
        if (row.$$isSectionHeader) {
            return false;
        }
        var expanded = this.rowExpansions.get(row);
        return expanded === 1;
    };
    DataTableBodyComponent.prototype.getSectionExpanded = function (section) {
        if (!section.$$isSectionHeader) {
            return false;
        }
        return this.sections[section.$$sectionIndex].expanded;
    };
    DataTableBodyComponent.prototype.getSectionCount = function (sectionId) {
        return this.sectionCounts ? this.sectionCounts[sectionId] : 0;
    };
    /**
     * Gets the row index of the item
     *
     * @param {*} row
     * @returns {number}
     * @memberof DataTableBodyComponent
     */
    DataTableBodyComponent.prototype.getRowIndex = function (row) {
        return this.rowIndexes.get(row);
    };
    DataTableBodyComponent.decorators = [
        { type: core_1.Component, args: [{
                    selector: 'datatable-body',
                    template: "\n    <datatable-selection\n      #selector\n      [selected]=\"selected\"\n      [activated]=\"activated\"\n      [columns]=\"columns\"\n      [rows]=\"temp\"\n      [selectCheck]=\"selectCheck\"\n      [selectEnabled]=\"selectEnabled\"\n      [selectionType]=\"selectionType\"\n      [rowIdentity]=\"rowIdentity\"\n      (select)=\"select.emit($event)\"\n      (activate)=\"activate.emit($event)\"\n      (activateCell)=\"activateCell.emit($event)\">\n      <datatable-progress\n        *ngIf=\"loadingIndicator\">\n      </datatable-progress>\n      <datatable-scroller\n        *ngIf=\"rows?.length\"\n        [scrollbarV]=\"scrollbarV\"\n        [scrollbarH]=\"scrollbarH\"\n        [scrollHeight]=\"scrollHeight\"\n        [scrollWidth]=\"columnGroupWidths.total\"\n        (scroll)=\"onBodyScroll($event)\">\n        <datatable-row-wrapper\n          *ngFor=\"let row of temp; let i = index; trackBy: rowTrackingFn;\"\n          [ngStyle]=\"getRowsStyles(row)\"\n          [rowDetail]=\"rowDetail\"\n          [detailRowHeight]=\"getDetailRowHeight(row,i)\"\n          [row]=\"row\"\n          [rowIndex]=\"getRowIndex(row)\"\n          [expanded]=\"getRowExpanded(row)\"\n          (rowContextmenu)=\"rowContextmenu.emit($event)\">\n          <datatable-body-section-header\n            *ngIf=\"row.$$isSectionHeader\"\n            tabindex=\"-1\"\n            [isSelected]=\"selector.getRowSelected(row)\"\n            [columns]=\"columns\"\n            [sectionHeaderTemplate]=\"sectionHeader\"\n            [sectionHeaderHeight]=\"getSectionHeaderHeight(row)\"\n            [row]=\"row\"\n            [rowIndex]=\"getRowIndex(row)\"\n            [expanded]=\"getSectionExpanded(row)\"\n            [sectionCount]=\"getSectionCount(row.$$sectionIndex)\"\n            [rowClass]=\"rowClass\"\n            (activate)=\"selector.onActivate($event, i)\">\n          </datatable-body-section-header>\n          <datatable-body-row\n            *ngIf=\"!row.$$isSectionHeader\"\n            tabindex=\"-1\"\n            [isSelected]=\"selector.getRowSelected(row)\"\n            [isActive]=\"selector.getRowActive(row)\"\n            [getCellActive]=\"selector.getCellActive\"\n            [innerWidth]=\"innerWidth\"\n            [offsetX]=\"offsetX\"\n            [columns]=\"columns\"\n            [rowHeight]=\"getRowHeight(row)\"\n            [row]=\"row\"\n            [rowIndex]=\"getRowIndex(row)\"\n            [expanded]=\"getRowExpanded(row)\"\n            [rowClass]=\"rowClass\"\n            [activateCell$]=\"activateCell\"\n            (activate)=\"selector.onActivate($event, i)\">\n          </datatable-body-row>\n        </datatable-row-wrapper>\n      </datatable-scroller>\n      <div\n        class=\"empty-row\"\n        *ngIf=\"!rows?.length\"\n        [innerHTML]=\"emptyMessage\">\n      </div>\n    </datatable-selection>\n  ",
                    changeDetection: core_1.ChangeDetectionStrategy.OnPush,
                    host: {
                        class: 'datatable-body'
                    }
                },] },
    ];
    /** @nocollapse */
    DataTableBodyComponent.ctorParameters = function () { return [
        { type: core_1.ChangeDetectorRef, },
    ]; };
    DataTableBodyComponent.propDecorators = {
        'scrollbarV': [{ type: core_1.Input },],
        'scrollbarH': [{ type: core_1.Input },],
        'loadingIndicator': [{ type: core_1.Input },],
        'externalPaging': [{ type: core_1.Input },],
        'rowHeight': [{ type: core_1.Input },],
        'sectionHeaderHeight': [{ type: core_1.Input },],
        'sectionHeader': [{ type: core_1.Input },],
        'sections': [{ type: core_1.Input },],
        'offsetX': [{ type: core_1.Input },],
        'emptyMessage': [{ type: core_1.Input },],
        'selectionType': [{ type: core_1.Input },],
        'activated': [{ type: core_1.Input },],
        'selected': [{ type: core_1.Input },],
        'rowIdentity': [{ type: core_1.Input },],
        'rowDetail': [{ type: core_1.Input },],
        'selectCheck': [{ type: core_1.Input },],
        'trackByProp': [{ type: core_1.Input },],
        'rowClass': [{ type: core_1.Input },],
        'sectionCounts': [{ type: core_1.Input },],
        'pageSize': [{ type: core_1.Input },],
        'rows': [{ type: core_1.Input },],
        'columns': [{ type: core_1.Input },],
        'offset': [{ type: core_1.Input },],
        'rowCount': [{ type: core_1.Input },],
        'innerWidth': [{ type: core_1.Input },],
        'bodyWidth': [{ type: core_1.HostBinding, args: ['style.width',] },],
        'bodyHeight': [{ type: core_1.Input }, { type: core_1.HostBinding, args: ['style.height',] },],
        'scroll': [{ type: core_1.Output },],
        'page': [{ type: core_1.Output },],
        'activate': [{ type: core_1.Output },],
        'activateCell': [{ type: core_1.Output },],
        'select': [{ type: core_1.Output },],
        'detailToggle': [{ type: core_1.Output },],
        'sectionHeaderToggle': [{ type: core_1.Output },],
        'rowContextmenu': [{ type: core_1.Output },],
        'scroller': [{ type: core_1.ViewChild, args: [scroller_component_1.ScrollerComponent,] },],
    };
    return DataTableBodyComponent;
}());
exports.DataTableBodyComponent = DataTableBodyComponent;
//# sourceMappingURL=body.component.js.map