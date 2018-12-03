import { Component, OnInit } from '@angular/core';
import { Project } from 'src/app/core/models/Project';
import { Subscription } from 'rxjs';
import { ProjectServiceService } from 'src/app/core/services/project-service.service';

export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
}


@Component({
  selector: 'app-view-projects',
  templateUrl: './view-projects.component.html',
  styleUrls: ['./view-projects.component.scss']
})
export class ViewProjectsComponent implements OnInit {
  projects: Project[];
  subscription: Subscription;
  constructor(private viewProjectsService: ProjectServiceService) { }

  ngOnInit() {
    this.subscription = this.viewProjectsService.getAllProjects()
          .subscribe((projectResponse) => {
            this.projects = projectResponse;
            console.log("got projects")
            console.log( projectResponse)
            console.log(projectResponse[0].teamPic[0])
            });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
