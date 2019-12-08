import { Component, OnInit, ElementRef } from '@angular/core';
import { faBookOpen } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  host: {
    '(document:click)': 'onClick($event)'
  },
})
export class HeaderComponent implements OnInit {
  faBookOpen = faBookOpen;
  showSelection = false;
  constructor(private _eref: ElementRef) {}

  ngOnInit() {
  }

  onClick(event) {
    if (!this._eref.nativeElement.contains(event.target)) {
      this.showSelection = false;
    }
  }

  toggleShow() {
    this.showSelection = !this.showSelection;
  }

}
