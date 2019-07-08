import {Component, OnInit} from '@angular/core';
import {ProjectService} from '../../../services/project.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss']
})
export class NavMenuComponent implements OnInit {

  loggedIn;
  panelOpenState = false;

  constructor(private projectService: ProjectService) {
  }

  ngOnInit() {

  }

  login() {
    this.loggedIn = true;
  }

  logout() {
    this.loggedIn = false;
  }

  getProjects(type) {
    switch (type) {
      case 'user':
        this.projectService.projFilter = 'user';
        break;
      case 'all':
        this.projectService.projFilter = 'all';
        break;
    }
  }
}
