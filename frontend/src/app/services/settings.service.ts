import { Injectable } from '@angular/core';
import { TranslocoService, LangDefinition } from '@ngneat/transloco';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  constructor(private translocoService: TranslocoService) {}

  public setLanguage(lang: string) {
    let availableLangs = this.translocoService.getAvailableLangs() as string[];
    if (!availableLangs.includes(lang)) {
      console.error(`Language ${lang} is not available`);
      return;
    }
    localStorage.setItem('lang', lang);
  }

  public getLanguage(): string {
    return localStorage.getItem('lang') || 'de';
  }
}
