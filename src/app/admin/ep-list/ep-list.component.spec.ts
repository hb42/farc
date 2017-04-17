import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EpListComponent } from './ep-list.component';

describe('EpListComponent', () => {
  let component: EpListComponent;
  let fixture: ComponentFixture<EpListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EpListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EpListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
