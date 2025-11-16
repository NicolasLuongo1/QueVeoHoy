import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  @Output()
  logoutEvent = new EventEmitter<void>();

  logout() {
    this.logoutEvent.emit();
  }
}