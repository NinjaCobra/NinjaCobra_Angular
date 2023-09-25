import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from "@angular/platform-browser";
import { of } from 'rxjs';
import { ninjaHasAnyGroupDirective } from '../../lib/src/ninja/has-any-group.directive';
import { ninjaAuthStateService } from '../../lib/src/ninja-angular';

@Component({ 
  template: `
  <div *ninjaHasAnyGroup="['test']">
    <div id="content">In group</div>
  </div>
  ` 
})
class MockComponent {}

function setup(ninjaAuthStateService: ninjaAuthStateService) {
  TestBed.configureTestingModule({
    declarations: [ 
      ninjaHasAnyGroupDirective,
      MockComponent
    ],
    providers: [{
      provide: ninjaAuthStateService,
      useValue: ninjaAuthStateService
    }],
  });
  return TestBed.createComponent(MockComponent);
}

describe('ninjaHasNayGroup Directive', () => {
  it('displays text when group matches', () => {
    const ninjaAuthStateService = {
      hasAnyGroups: jest.fn().mockImplementation(() => of(true))
    } as unknown as ninjaAuthStateService;
    const fixture = setup(ninjaAuthStateService);
    fixture.detectChanges();

    const contentEl = fixture.debugElement.query(By.css('#content'));
    expect(contentEl.nativeElement.textContent).toBe('In group');
  });

  it('should not display text when not matches', () => {
    const ninjaAuthStateService = {
      hasAnyGroups: jest.fn().mockImplementation(() => of(false))
    } as unknown as ninjaAuthStateService;
    const fixture = setup(ninjaAuthStateService);
    fixture.detectChanges();

    const contentEl = fixture.debugElement.query(By.css('#content'));
    expect(contentEl).toBeFalsy();
  });
});
