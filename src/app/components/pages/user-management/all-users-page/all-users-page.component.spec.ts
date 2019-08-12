import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule, MatSidenavModule, MatIconModule,
  MatMenuModule, MatToolbarModule, MatExpansionModule }
  from '@angular/material';

  import { SidenavComponent } from 'src/app/components/HUD/sidenav/sidenav.component';
  import { NavMenuComponent } from 'src/app/components/HUD/nav-menu/nav-menu.component';
  import { AllUsersPageComponent } from './all-users-page.component';

describe('AllUsersPageComponent', () => {
  let component: AllUsersPageComponent;
  let fixture: ComponentFixture<AllUsersPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllUsersPageComponent, SidenavComponent, NavMenuComponent ],
      imports: [ MatSnackBarModule, MatSidenavModule, MatIconModule,
        MatMenuModule, MatToolbarModule, 
        MatExpansionModule, RouterTestingModule, 
        HttpClientTestingModule ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllUsersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});