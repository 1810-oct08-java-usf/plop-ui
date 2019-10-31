import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgMetaService} from 'ngmeta'; // TODO use to change title to 'Edit | RPM' or something
import {Subscription} from 'rxjs';
import {Project} from 'src/app/models/Project';
import {ProjectService} from 'src/app/services/project.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/User';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
 selector: 'app-edit-project',
 templateUrl: './project-edit.component.html',
 styleUrls: ['./project-edit.component.scss']
})

/* This component adds functionality to edit a project. However, the server is adding an extra header to the response causing the following
   error: The 'Access-Control-Allow-Origin' header contains multiple values 'http://localhost:4200, http://localhost:4200', but only one is allowed.
   This needs to be addressed on the server to move forward. */

export class ProjectEditComponent implements OnInit {
 techStackList = ['Java/J2EE', 'PEGA', 'JavaScript MVC', '.Net', 'React.js', 'Java', 'iOS9'];

 /* This field is initially true since the project contents for a particular project are placed in the form fields using two-way binding when
       ngOnInit() is called and the project is retrieved by id from the server */
 validForm: Boolean = true;

 // projectToUpdate will hold project information for a specific project returned by id and
 // is bound to the information that users enter in the form
 projectToUpdate: Project;
 originalProject: Project;
 user: User;

 /**
  * title, questionType, and result are all passed to a dialog when the user chooses either the group member or the links input field
  * title and questionType represent the information which will displayed in an input dialog
  * result will hold the user's response, either a group member or a link to be validated as a Github repository link
  * @author Shawn Bickel (1810-Oct08-Java-USF)
  */
 title = 'New Group Member';
 questionType = 'Enter the name of the group member';
 result;

 groupMember = '';

 subscription: Subscription; // will be used to subscribe to the results of an observable

 constructor(private router: Router,
   private snackbarService: SnackbarService,
   private projectService: ProjectService,
   private route: ActivatedRoute,
	private userService: UserService,
   //private ngmeta: NgMetaService,
   ) { }

 ngOnInit() {
  this.projectService.CurrentProject$.asObservable().subscribe(
    project => {
      this.projectToUpdate = JSON.parse(JSON.stringify(project));
      this.originalProject = project;
    })
	this.userService.user.asObservable().subscribe(
		user => {
			this.user = user;
		}
  );
  //this.ngmeta.setHead({ title: 'Edit Project | RPM' });
 }

 /**
  * This method determines if the entire form is valid when focus is removed from an input field
  * @param nameField : the template variable for the name input field which holds validation information
  * @param batchField : the template variable for the batch input field which holds validation information
  * @param trainerField : the template variable for the trainer name input field which holds validation information
  * @param descriptionField : the template variable for the description input field which holds validation information
  * @param techStackField : the template variable for the technology stack input field which holds validation information
  * @author Shawn Bickel (1810-Oct08-Java-USF)
  */
 checkForValidField(nameField, batchField, trainerField, descriptionField, techStackField) {
   if (!nameField.valid || !batchField.valid || !trainerField.valid || !descriptionField.valid || !techStackField.valid) {
     this.validForm = false;
   } else {
     this.validForm = true;
   }
 }

 /**
  * This method is bound to the event that the form is submitted;
  * The updated project is sent to a service where it is sent to the server with an http put method
  * @author Shawn Bickel (1810-Oct08-Java-USF)
  */
 submitForm() {
  this.projectToUpdate.status = 'Pending';
  this.projectToUpdate.oldProject = null;
  this.projectToUpdate.oldProject = this.originalProject;  //Setting the original project inside the updated project
  this.projectToUpdate.oldProject.oldProject = null;
  this.projectService.submitEditRequest(this.projectToUpdate).subscribe(
    (res) => {
      this.snackbarService.openSnackBar("Your update was successful", "Success");
      window.history.back();
    },
    (err) => {
      console.log("Error obj from project edit", err);
      this.snackbarService.openSnackBar("Something went wrong. Try again", "Failed");
    }
  );
  

 }

 back() {
   window.history.back();
 }

 /**
  * These methods allow for the removal and addition of users to projects when editing.
  * @author Ryan Williams (1810-Oct20-Java-USF)
  */
 removeGroupMember(e) {// project : Project
   const updatedArr = this.projectToUpdate.groupMembers;
   const nameToRemove = e.target.textContent;
   const index = updatedArr.indexOf(nameToRemove);
   updatedArr.splice(index, 1);
   this.projectToUpdate.groupMembers = updatedArr;
 }

 addGroupMember() {
   const updatedArr = this.projectToUpdate.groupMembers;
   const nameToAdd = this.groupMember;
   updatedArr.push(nameToAdd);
   this.projectToUpdate.groupMembers = updatedArr;
   this.groupMember = '';
 }

 cancelEdit() {
   this.router.navigate(['projects/'+this.user.id]);
 }

}