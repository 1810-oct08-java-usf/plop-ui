import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { ProjectSubmissionComponent, DialogData } from '../project-submission.component';

@Component({
  selector: 'app-edit-dialog',
  templateUrl: './edit-dialog.component.html',
  styleUrls: ['./edit-dialog.component.scss']
})

/**
 * This component defines the content and behavior of the input dialog that is used to collect group member and
 * repository links information when a project is submitted
 * @author Sean Doyle (1810-oct22-java-usf)
 */
export class EditDialogComponent implements OnInit {

  inEditMode: boolean[] = [];
  editedValues: string[] = [];

  /**
   * @param dialogRef : injects a reference to the dialog defined in the class of the project submission component
   * @param data : the data passed to the dialog
   *
   * @author Sean Doyle (1810-Oct22-Java-USF)
   */
  constructor(public dialogRef: MatDialogRef<ProjectSubmissionComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  /**
   * Method takes in the list item's displayed value,
   * finds the index of that item in the list which is in the data.values, recreates the passed in array
   * with the passed in item removed from the array.
   *
   * @param e The event tied with the remove button for a given list item
   */
  removeItem(e) {
    const indexOfName = this.data.values.indexOf(e.target.id);
    this.data.values = this.data.values.slice(0, indexOfName).concat(this.data.values.slice(indexOfName + 1, this.data.values.length));
    this.editedValues = this.editedValues.slice(0, indexOfName).concat(this.editedValues.slice(indexOfName + 1, this.editedValues.length));
    this.inEditMode = this.inEditMode.slice(0, indexOfName).concat(this.inEditMode.slice(indexOfName + 1, this.inEditMode.length));
  }

  allowEdit(e) {
    console.log('jabber');
    console.log(e.target.id);
    const indexOfName = this.data.values.indexOf(e.target.id);
    this.inEditMode[indexOfName] = !this.inEditMode[indexOfName];
  }

  modifyField(e) {
    const indexOfName = this.data.values.indexOf(e.target.id);
    this.data.values[indexOfName] = this.editedValues[indexOfName];
    this.inEditMode[indexOfName] = false;
  }

  addItem(e) {
    console.log(this.data.result);
    // The if statement treats undefined, null, and empty values as 'falsey' and there for the if-statement will decline the value
    if (this.data.result) {
      this.data.values.push(this.data.result);
      this.inEditMode.push(false);
      this.editedValues.push(this.data.result);
      this.data.result = '';
    }
  }

  onEnter(e) {
    console.log('Jiffy');
    if (e.key === 'Enter') {
      console.log(e.target.id);
    }
  }

  ngOnInit() {
    this.data.values.forEach(index =>
      this.editedValues.push(index),
      this.inEditMode.push(false)
    );
  }
}
