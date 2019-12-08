import { CommonModule } from "@angular/common";
import {  FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { SideBarComponent } from './components/side-bar/side-bar.component';
import { FooterComponent } from './components/footer/footer.component';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { LayoutComponent } from './layouts/layout/layout.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

const BASE_MODULES = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  RouterModule,
];

const COMPONENTS = [HeaderComponent, SideBarComponent, FooterComponent];

const PIPES = [];

@NgModule({
  imports: [...BASE_MODULES, FontAwesomeModule],
  exports: [...BASE_MODULES, ...COMPONENTS, ...PIPES],
  declarations: [...COMPONENTS, ...PIPES, LayoutComponent],
})

export class ThemeModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ThemeModule,
      providers: [],
    }
  }
}
