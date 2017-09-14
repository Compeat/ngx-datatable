import { ElementRef, KeyValueDiffers, EventEmitter, ChangeDetectorRef, DoCheck } from '@angular/core';
import { ScrollbarHelper } from '../../services';
export declare class DataTableBodyRowComponent implements DoCheck {
    private differs;
    private scrollbarHelper;
    private cd;
    columns: any[];
    innerWidth: number;
    expanded: boolean;
    rowClass: any;
    row: any;
    rowIdentity: (t: any) => any;
    offsetX: number;
    isSelected: boolean;
    isActive: boolean;
    getCellActive: (row: any, col: number) => boolean;
    rowIndex: number;
    activateCell$: EventEmitter<any>;
    readonly cssClass: string;
    rowHeight: number;
    readonly columnsTotalWidths: string;
    activate: EventEmitter<any>;
    element: any;
    columnGroupWidths: any;
    columnsByPin: any;
    _columns: any[];
    _innerWidth: number;
    private rowDiffer;
    constructor(differs: KeyValueDiffers, scrollbarHelper: ScrollbarHelper, cd: ChangeDetectorRef, element: ElementRef);
    ngDoCheck(): void;
    trackByGroups(index: number, colGroup: any): any;
    columnTrackingFn(index: number, column: any): any;
    stylesByGroup(group: string): {
        width: string;
    };
    onActivate(event: any, index: number): void;
    onKeyDown(event: KeyboardEvent): void;
    recalculateColumns(val?: any[]): void;
}
