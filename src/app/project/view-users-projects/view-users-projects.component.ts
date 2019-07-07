import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { User } from 'src/app/core/models/User';
import { Project } from 'src/app/core/models/Project';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { ProjectService } from 'src/app/core/services/project.service';
import { UserService } from 'src/app/core/services/user.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-view-users-projects',
  templateUrl: './view-users-projects.component.html',
  styleUrls: ['./view-users-projects.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ViewUsersProjectsComponent implements OnInit, OnDestroy {
  
  constructor(private router: Router, private viewProjectsService: ProjectService, private userService: UserService, private projectService: ProjectService) { }

  trainerCanEdit = false;
  currentUser: User;
  displayedColumns: string[] = ['name', 'batch', 'trainer', 'techStack', 'status'];
  dataSource: MatTableDataSource<Project>;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  expandedProject: Project | null;

  imagePage = 0;

  userProjects: Project[] = [];
  subscription: Subscription;
  AllProjects$ =  this.projectService.AllProjects.asObservable();

  retrievingProjects = true;

  ngOnInit() {

    if (!localStorage.getItem('jwt')) this.router.navigate(['/auth/login']);

      this.currentUser = this.userService.getUser();
      this.subscription = this.viewProjectsService.getAllProjects()
      .subscribe(
        (projectResponse) => {
        this.retrievingProjects = false;
        this.projectService.AllProjects.next(projectResponse);
        console.log(projectResponse);
        console.log(this.projectService.AllProjects);
        this.updateProjects();
      });
  }

  updateProjects() {
    const trainerFullName = this.currentUser.firstName.trim() + ' ' + this.currentUser.lastName.trim();
    this.AllProjects$.subscribe(
      allprojects => {
        for (let i = 0; i < allprojects.length; i++){
          if(allprojects[i].trainer === trainerFullName){
          this.userProjects.push(allprojects[i]);
          }
        }
        this.dataSource = new MatTableDataSource(this.userProjects);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      }
    )
  }

    /**
   * This method determines if a trainer can edit a project; a trainer can only edit a project if the project was submitted by the trainer.
   * @param project: the project who's trainer is being validated
   * @author Shawn Bickel (1810-Oct08-Java-USF)
   */
  canEdit(project: any) {
    const trainerFullName = this.currentUser.firstName.trim() + ' ' + this.currentUser.lastName.trim();
    if (this.currentUser.role === 'ROLE_ADMIN') {
      this.trainerCanEdit = true;
    } else if (trainerFullName === project.trainer) {
      this.trainerCanEdit = true;
    } else {
      this.trainerCanEdit = false;
    }
  }

    /**
  * this is a lifecycle method called once by Angular before the component is destroyed;
  * it is usually used to close resources such as unsubscribing from the observable's data stream;
  * resources should be released to avoid memory leaks
  * @author Shawn Bickel (1810-Oct08-Java-USF)
  */
 ngOnDestroy() {
  if (this.subscription) {
    this.subscription.unsubscribe();
  }
}

  /**
   * This function is used to filter the table based on the inputted string.
   * It is binded as an event listener.
   * @param filterValue : a string value that is used to filter the dataSource for the MatTable
   * @author Yuki Mano (1810-Oct08-Java-USF)
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
    /**
   * This function is used to increment the page index of the project's screenshot.
   * Incrementing the page index will render the next project's screenshot.
   * @param totalAmountOfScreenShots : a number value that contains the total number of screenshots for a particular project
   * @author Yuki Mano (1810-Oct08-Java-USF)
   */
  nextImage(totalAmountOfScreenShots: number) {
    this.imagePage = (this.imagePage + 1) % totalAmountOfScreenShots;
  }

  /**
   * This function is used to decrement the page index of the project's screenshot.
   * Decrementing the page index will render the next project's screenshot.
   * @param totalAmountOfScreenShots : a number value that contains the total number of screenshots for a particular project
   * @author Yuki Mano (1810-Oct08-Java-USF)
   */
  previousImage(totalAmountOfScreenShots: number) {
    this.imagePage--;
    if (this.imagePage < 0) {
      this.imagePage = totalAmountOfScreenShots;
    }
  }
  codebase(project) {
    this.viewProjectsService.CurrentProject = project;
    this.router.navigate(['/codebase']);
  }

  edit(project) {
    this.router.navigate([project.id + '/edit']);
  }
}
