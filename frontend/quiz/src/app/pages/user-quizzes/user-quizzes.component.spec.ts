import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserQuizzesComponent } from './user-quizzes.component';

describe('UserQuizzesComponent', () => {
  let component: UserQuizzesComponent;
  let fixture: ComponentFixture<UserQuizzesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserQuizzesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserQuizzesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
