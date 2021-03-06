import {
  Component, Input, Output, EventEmitter, HostListener, HostBinding, ChangeDetectionStrategy
} from '@angular/core';
import { mouseEvent } from '../../events';

@Component({
  selector: 'datatable-row-wrapper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-content></ng-content>
    <div
      *ngIf="expanded"
      [style.height.px]="detailRowHeight"
      class="datatable-row-detail">
      <ng-template
        *ngIf="rowDetail && rowDetail.template"
        [ngTemplateOutlet]="rowDetail.template"
        [ngOutletContext]="{
          row: row,
          expanded: expanded,
          rowIndex: rowIndex
        }">
      </ng-template>
    </div>
  `
})
export class DataTableRowWrapperComponent {

  @Input() rowDetail: any;
  @Input() detailRowHeight: any;
  @Input() expanded: boolean = false;
  @Input() row: any;
  @Input() rowIndex: number;
  @Input() isSelected: boolean = false;
  @Input() isActive: boolean = true;
  @Input() allowKeyEventPropagation: boolean = false;

  @Output() rowContextmenu = new EventEmitter<{ event: MouseEvent, row: any }>(false);

  @HostListener('contextmenu', ['$event'])
  onContextmenu($event: MouseEvent): void {
    this.rowContextmenu.emit({ event: $event, row: this.row });
  }

  @HostBinding('class')
  get cssClass() {
    let classes = 'datatable-row-wrapper';
    if (this.isSelected) {
      classes += ' selected';
    }
    if (this.isActive) {
      classes += ' active';
    }
    return classes;
  }
}
