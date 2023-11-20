import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './services/auth.interceptor';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { CoreModule } from './core/core.module';
import { TranslocoRootModule } from './transloco-root.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { APP_INITIALIZER } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';

export function preloadTranslations(translocoService: TranslocoService) {
  const locale = localStorage.getItem('lang') || 'de';
  return async () => await translocoService.load(locale).toPromise();
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    TranslocoRootModule,
    FontAwesomeModule,
    BrowserModule,
    AppRoutingModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    RouterModule,
    HttpClientModule,
    CoreModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: preloadTranslations,
      deps: [TranslocoService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
