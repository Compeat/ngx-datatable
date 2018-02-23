import {
  Component, Input, PipeTransform, HostBinding, ViewChild, ChangeDetectorRef,
  Output, EventEmitter, HostListener, ElementRef, ViewContainerRef, OnDestroy, DoCheck,
  ChangeDetectionStrategy, OnInit
} from '@angular/core';

import { Codes } from '../../utils';
import { SortDirection } from '../../types';
import { TableColumn } from '../../types/table-column.type';
import { mouseEvent, keyboardEvent } from '../../events';

@Component({
  selector: 'datatable-body-cell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="datatable-body-cell-decorator"></div>
    <div class="datatable-body-cell-label">
      <label
        *ngIf="column.checkboxable"
        class="datatable-checkbox">
        <input
          type="checkbox"
          [checked]="isSelected"
          (click)="onCheckboxChange($event)"
        />
      </label>
      <span
        *ngIf="!column.cellTemplate"
        [title]="sanitizedValue"
        [innerHTML]="value">
      </span>
      <ng-template #cellTemplate
        *ngIf="column.cellTemplate"
        [ngTemplateOutlet]="column.cellTemplate"
        [ngOutletContext]="cellContext">
      </ng-template>
    </div>
  `,
  host: {
    class: 'datatable-body-cell'
  }
})
export class DataTableBodyCellComponent implements DoCheck, OnDestroy, OnInit {

  @Input() rowHeight: number;

  @Input() set isSelected(val: boolean) {
    this._isSelected = val;
    this.cellContext.isSelected = val;
    this.cd.markForCheck();
  }
  get isSelected(): boolean {
    return this._isSelected;
  }

  @Input() set isActive(val: boolean) {
    this._isActive = val;
    this.cellContext.isActive = val;
    this.cd.markForCheck();
  }
  get isActive(): boolean {
    return this._isActive;
  }

  @Input() set expanded(val: boolean) {
    this._expanded = val;
    this.cellContext.expanded = val;
    this.cd.markForCheck();
  }

  get expanded(): boolean {
    return this._expanded;
  }

  @Input() set rowIndex(val: number) {
    this._rowIndex = val;
    this.cellContext.rowIndex = val;
    this.checkValueUpdates();
    this.cd.markForCheck();
  }

  get rowIndex(): number {
    return this._rowIndex;
  }

  @Input() set column(column: TableColumn) {
    this._column = column;
    this.cellContext.column = column;
    this.checkValueUpdates();
    this.cd.markForCheck();
  }

  get column(): TableColumn {
    return this._column;
  }

  @Input() set row(row: any) {
    this._row = row;
    this.cellContext.row = row;
    this.checkValueUpdates();
    this.cd.markForCheck();
  }

  get row(): any {
    return this._row;
  }

  @Input() rowIdentity: (t: any) => any;

  @Input() set sorts(val: any[]) {
    this._sorts = val;
    this.calcSortDir = this.calcSortDir(val);
  }

  get sorts(): any[] {
    return this._sorts;
  }

  @Input() activateCell$: EventEmitter<any>;

  @Input() allowKeyEventPropagation: boolean = false;

  @Output() activate: EventEmitter<any> = new EventEmitter();

  @ViewChild('cellTemplate', { read: ViewContainerRef }) cellTemplate: ViewContainerRef;

  @HostBinding('class')
  get columnCssClasses(): any {
    let cls = 'datatable-body-cell';
    if (this.column.cellClass) {
      if (typeof this.column.cellClass === 'string') {
        cls += ' ' + this.column.cellClass;
      } else if (typeof this.column.cellClass === 'function') {
        const res = this.column.cellClass({
          row: this.row,
          column: this.column,
          value: this.value
        });

        if (typeof res === 'string') {
          cls += res;
        } else if (typeof res === 'object') {
          const keys = Object.keys(res);
          for (const k of keys) {
            if (res[k] === true) cls += ` ${k}`;
          }
        }
      }
    }
    if (!this.sortDir) cls += ' sort-active';
    if (this.isActive) cls += ' active';
    if (this.sortDir === SortDirection.asc) cls += ' sort-asc';
    if (this.sortDir === SortDirection.desc) cls += ' sort-desc';
    return cls;
  }

  @HostBinding('style.width.px')
  get width(): number {
    return this.column.width;
  }

  @HostBinding('style.height')
  get height(): string | number {
    const height = this.rowHeight;
    if (isNaN(height)) return height;
    return height + 'px';
  }

  sanitizedValue: any;
  value: any;
  sortDir: SortDirection;
  onCheckboxChangeFn = this.onCheckboxChange.bind(this);
  activateFn = this.activate.emit.bind(this.activate);

  cellContext: any = {
    onCheckboxChangeFn: this.onCheckboxChangeFn,
    activateFn: this.activateFn,
    row: this.row,
    value: this.value,
    column: this.column,
    isSelected: this.isSelected,
    isActive: this.isActive,
    rowIndex: this.rowIndex,
  };

  private _isSelected: boolean;
  private _isActive: boolean;
  private _sorts: any[];
  private _column: TableColumn;
  private _row: any;
  private _rowIndex: number;
  private _expanded: boolean;
  private _element: any;
  private activateCellSub: any;

  constructor(element: ElementRef, private cd: ChangeDetectorRef) {
    this._element = element.nativeElement;
  }

  ngDoCheck(): void {
    this.checkValueUpdates();
  }

  ngOnDestroy(): void {
    if (this.cellTemplate) {
      this.cellTemplate.clear();
    }
    if (this.activateCellSub) { this.activateCellSub.unsubscribe(); }
  }

  ngOnInit(): void {
    this.activateCellSub = this.activateCell$.subscribe(() => {

      this.cd.markForCheck();
    });
  }

  checkValueUpdates(): void {
    let value = '';

    if (!this.row || !this.column) {
      value = '';
    } else {
      const val = this.column.$$valueGetter(this.row, this.column.prop);
      const userPipe: PipeTransform = this.column.pipe;

      if (userPipe) {
        value = userPipe.transform(val);
      } else if (value !== undefined) {
        value = val;
      }
    }

    if(this.value !== value) {
      this.value = value;
      this.cellContext.value = value;
      this.sanitizedValue = this.stripHtml(value);
      this.cd.markForCheck();
    }
  }

  @HostListener('focus')
  onFocus(): void {
    this.cd.markForCheck();
  }

  @HostListener('blur')
  onBlur(): void {
    this.cd.markForCheck();
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    this.activate.emit({
      type: 'click',
      event,
      row: this.row,
      column: this.column,
      value: this.value,
      cellElement: this._element
    });
  }

  @HostListener('dblclick', ['$event'])
  onDblClick(event: MouseEvent): void {
    this.activate.emit({
      type: 'dblclick',
      event,
      row: this.row,
      column: this.column,
      value: this.value,
      cellElement: this._element
    });
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const code = event.key || event.code;
    const isContainedCell = this._element.contains(event.target);

    const isAction =
      code === Codes.return ||
      code === Codes.down ||
      code === Codes.up ||
      code === Codes.left ||
      code === Codes.right ||
      code === Codes.tab;

    if (isAction && isContainedCell) {
      if (!this.allowKeyEventPropagation) {
        event.preventDefault();
        event.stopPropagation();
      }

      this.activate.emit({
        type: 'keydown',
        event,
        row: this.row,
        column: this.column,
        value: this.value,
        cellElement: this._element
      });
    }
  }

  onCheckboxChange(event: any): void {
    this.activate.emit({
      type: 'checkbox',
      event,
      row: this.row,
      column: this.column,
      value: this.value,
      cellElement: this._element
    });
  }

  calcSortDir(sorts: any[]): any {
    if (!sorts) return;

    const sort = sorts.find((s: any) => {
      return s.prop === this.column.prop;
    });

    if (sort) return sort.dir;
  }

  stripHtml(html: string): string {
    if(!html.replace) return html;
    return html.replace(/<\/?[^>]+(>|$)/g, '');
  }

}
