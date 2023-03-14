import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WaitingComponent } from './components/waiting/waiting.component';
import { LoadingComponent } from './components/loading/loading.component';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { CheckUpperDirective } from './validators/check-upper.directive';
import { CheckLowerDirective } from './validators/check-lower.directive';
import { CheckSymbolDirective } from './validators/check-symbol.directive';
import { CheckNumberDirective } from './validators/check-number.directive';

@NgModule({
  declarations: [
    WaitingComponent,
    LoadingComponent,
    HeaderComponent,
    CheckUpperDirective,
    CheckLowerDirective,
    CheckSymbolDirective,
    CheckNumberDirective,
  ],
  imports: [CommonModule, RouterModule],
  exports: [
    WaitingComponent,
    LoadingComponent,
    HeaderComponent,
    CheckUpperDirective,
    CheckLowerDirective,
    CheckSymbolDirective,
    CheckNumberDirective,
  ],
})
export class SharedModule {}
