import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import * as JSZip from 'jszip';
import { map } from 'rxjs/operators';
import { ProjectService } from 'src/app/core/services/project.service';

@Component({
  selector: 'app-zip-component',
  templateUrl: './zip.component.html',
  styleUrls: ['./zip.component.scss']
})
/*
* ZipComponent is Reponsible for Unzipping and Rendering a file.zip
*
* If stream is unresovable error when ng serve and attempt to render
* then in tsconfig.json (not.app.json or tsoncif.spec.json. the top level tsconfig.json)
* add the following code path to the file compileroptions
* Do not manually go and change in node modules JSzip to readable-stream from stream
* Git push ignores app modules but not tsconfig.json
*
* "paths": {
      "jszip": [
        "node_modules/jszip/dist/jszip.min.js"
      ]
    },
* @author Andrew Mitchem (1810-Oct08-Java-USF)
*/
export class ZipComponent implements OnInit {
  RenderFile: RenderFile[] = [];
  SelectedFile: RenderFile;
  OpenFile: RenderFile[] = [];
  filepath: string = '';
  browserSupported: boolean = true;
  /*Constructur: Injects Http Client into the component for use of resource request
  *@param HttpClient standard angular dependency to fire http request.
  *@param Location: Allows the page to redirect back to the last page it was opened from
  *@param ProjectService: Injects the project service to get the request url
  *@author Andrew Mitchem (1810-Oct08-Java-USF)
  */
  constructor(private http: HttpClient, private location: Location,private projectService: ProjectService) { }

  ngOnInit() {
    
    this.SelectedFile = this.defaultFile();
    let isTextDecoderSupported = false;
    try { isTextDecoderSupported  = !!new TextDecoder('utf-8') 
          
          } catch(e){
      
          }
         
    this.browserSupported = isTextDecoderSupported
  }
  /*zip.errorFIle
  *sets the defualt display for error messages
  *@param message
  *@author Andrew Mitchem (1810-Oct08-Java-USF)
  */
 openRenderFile(file: RenderFile){
  this.SelectedFile = file; 
  !this.OpenFile.includes(file) && this.OpenFile.push(file)
 }
 closeRenderFile(file: RenderFile){
  this.OpenFile.splice( this.OpenFile.indexOf(file), 1 );
  if(!this.OpenFile.length)
   this.SelectedFile=this.defaultFile();
 }
  errorFile(message: string): RenderFile{
    let testfile = new  RenderFile();
    testfile.fileName = "HELP";
    testfile.fileContent = 
    `ERROR:${message}`;
    return testfile;
  }
  /*zip..defualtFile
  * sets the defualt display message as a helpme file
  *@author Andrew Mitchem (1810-Oct08-Java-USF)
  */
  defaultFile(): RenderFile{
    let testfile = new  RenderFile();
    testfile.fileName = "HELP";
    testfile.fileContent = 
    `HELPME: use the first 🗁 (blue) to import the remote saved codebase zip. 
use the second 🗁 (green) to open a local repo zip. 
⌂ to return to the websites
      
Currently can open and navigate to the src directory of Angular and Java Repositories
    `;
      return testfile;
  }
  /*
   *Zip.goBack()
  * Redirects back to the last page
  * @author Andrew Mitchem (1810-Oct08-Java-USF)
  */
  goBack() {
    this.location.back();
  }
  /*
  * Zip.sendRequest()
  * Fire off an http request to retrieve the zip file
  * @author Andrew Mitchem (1810-Oct08-Java-USF)
  *
  */
  sendRequest() {
    let url = 'https://s3.us-east-2.amazonaws.com/zip-test-bucket/reflections-mafia-client-master.zip'
    //reponse type is arraybuffer so the get request knows this is a oclet-array-stream request
    this.http.get(url,{ observe: 'response', responseType: 'blob'})
    .subscribe(blob => {
      //after the array is retrieve. open the data with JSZip
      console.log('got (ui8Arra)');
      console.log(blob);
      console.log(blob.body);
      console.log(blob.headers);
      console.log(blob.headers.get('content-disposition'));
      if(blob.headers.get('content-disposition')){
        let datafilename = this.getFileNameFromHttpResponse(blob.headers.get('content-disposition'));
        console.log(datafilename);
        this.openData(blob.body,datafilename);
      }else{
        let datafilename = url.substring(url.lastIndexOf("/")+1);
        this.openData(blob.body,datafilename);
      } 
    });
  }
   /*
   *Zip.getFileNameFromHttpResponse()
  * splits content-dispotion header ; attachmenent file=filename.ext into file name
  * from stack overflow
  * @author Andrew Mitchem (1810-Oct08-Java-USF)
  */
  getFileNameFromHttpResponse(contentDispositionHeader) {
    var result = contentDispositionHeader.split(';')[1].trim().split('=')[1];
    return result.replace(/"/g, '');
  }
  /*
  * Zip.openData()
  * unpacks a zip blob(ui8array) and opens with JSZip (zip is the reference variable)
  * @param data. ui8array blob object that "is" a valid zip file.
  * @param datafilename, optional. passed in file name.
  * @author Andrew Mitchem (1810-Oct08-Java-USF)
  */
 openData(data , datafilename?){
  console.log("This is your data file: "+datafilename)
  this.RenderFile= [];
  this.SelectedFile = this.defaultFile();
  this.OpenFile = [];
  // console.log("hi")
  console.log("This is your data: " )
  console.log(data);
  let dataname ='';
  if(data.name)
      dataname = data.name.substring(0,data.name.lastIndexOf("."));
  else
      dataname = datafilename.substring(0,datafilename.lastIndexOf("."));
  console.log(dataname)
   let zip = new JSZip(); 
   //new instance of JSZip. note this object lifecycle needs to be undone after rendering
   //as such it not a class member but function member only for the scope of this function closure
   zip.loadAsync(data)
      .then(contents=>{
        console.log(contents)
        //console.log(this.RenderStrings)
        //move to the sub folder inside the zip file: replace with pass paramater variables
        if(!zip.folder(new RegExp(dataname)).length) {
          console.log("malformed package");
          this.SelectedFile= this.errorFile("Package didn't match zip filename");
          return;
        }
        let dirFolder =  zip.folder(dataname)
        console.log(dirFolder)
        console.log(dirFolder.folder(/src\/main\/java/))
        if(dirFolder.folder(/src\/main\/java/).length){
          console.log('Hi')
           dirFolder =  dirFolder.folder('src/main/java')
           console.log(dirFolder)
           this.filepath = dataname + '/src/main/java';
        }else if (dirFolder.folder(/src\/app/).length){ 
          console.log('Hello')
          dirFolder =  dirFolder.folder('src/app')
          console.log(dirFolder)
          this.filepath = dataname + '/src/app';
        }else{
          console.log("malformed package. not angular or java");
          this.SelectedFile= this.errorFile("cannot determined repo language type");
          return;
        }
        let fileArray = dirFolder.file(/^.*/) //get the array of all files in this subdirectory 
        for(let i = 0; i < fileArray.length; i++){
          let file = fileArray[i]
          this.parseFiles(file);
        }
    })
}
   /*
  * Zip.parseFiles(file)
  * opens and individual zip file. This method ignores files that are directories (ie. not files with contnet)
  * @param file. ZipObject (class of JSzip) to be unpacked into a normal blob object
  * @author Andrew Mitchem (1810-Oct08-Java-USF)
  */
  parseFiles(file) {
    // check if file is a directory
    if (!file.dir) {
        let fileName = file.name;
        // save ZipObject file name as once unzip into a  standard file  we loose acess to this data
        fileName = fileName.replace(this.filepath, '');
        fileName = fileName.substring(fileName.lastIndexOf('/') + 1);
        // remove leading path in name
        if(this.browserSupported){
          let helpme = file.async('uint8array').then(function (data) { // converts the ZipObject
            let string = 'Placeholder Text \n we are sorry your browser may not be supported';
            
            
            string = new TextDecoder('utf-8').decode(data);
            return string;
          });
          helpme.then(string => {
            const file = new RenderFile();
            file.fileName = fileName;
            file.fileContent = string; // "file here is a string text readable format stored for rendering logic"
            this.RenderFile.push(file);
          });
        }else{
          file.fileName = fileName;
            file.fileContent = `Sorry @Browser not currently supported
            ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈████≈
≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈█████≈
≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈███████
≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈████████
≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈█████████
≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈███▒▒████
≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈████▒▒▒███
≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈███▒▒▒▒▒██
≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈███▒▒▒▒▒▒██
≈≈≈≈≈≈████████≈≈≈≈≈≈≈≈≈≈≈≈██▒▒▒▒▒▒▒██
≈≈≈≈███████████≈≈≈≈≈≈≈≈≈≈≈██▒▒▒▒▒▒▒██
≈≈██████████████≈≈≈≈≈≈≈≈≈≈█▒▒▒▒▒▒▒▒██
███████████▒▒▒▒██≈≈≈≈≈≈≈≈≈█▒▒▒▒▒▒▒▒██
████████▒▒▒▒▒▒▒▒██≈≈≈≈≈≈≈≈█▒▒▒▒▒▒▒▒██
██████▒▒▒▒▒▒▒▒▒▒▒█≈≈████≈≈██▒▒▒▒▒▒▒██
███████▒▒▒▒▒▒▒▒▒▒███████████▒▒▒▒▒▒▒██
███████▒▒▒▒▒▒▒▒▒▒██▒▒▒▒▒▒▒██▒▒▒▒▒▒▒██
≈█████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██≈
≈≈█████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██≈≈
≈≈≈█████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██≈≈≈
≈≈≈≈██████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██≈≈≈≈
≈≈≈≈≈██████▒▒▒▒▒▒██▒▒▒▒▒▒▒▒▒██▒██≈≈≈≈
≈≈≈≈≈≈████████▒▒█▌▐█▒▒▒▒▒▒▒█▌▐█▒█≈≈≈≈
≈≈≈≈≈≈≈≈█████▒▒▒█▌▐█▒▒▒▒▒▒▒█▌▐█▒█≈≈≈≈
≈≈≈≈≈≈≈≈≈≈≈≈█▒▒▒████▒▒▒▒▒▒▒████▒██≈≈≈
≈≈≈≈≈≈≈≈≈≈≈≈█▒▒▒████▒▒▒▒█▒▒████▒██≈≈≈
≈≈≈≈≈≈≈≈≈≈≈██▒▒▒███▒▒▒▒▒▒▒▒▒███▒▒█≈≈≈
≈≈≈≈≈≈≈≈≈≈≈██▒▒▒▒▒▒▒▒██████▒▒▒▒▒▒█≈≈≈
≈≈≈≈≈≈≈≈≈≈≈██▒███▒▒▒▒██████▒▒▒████≈≈≈
≈≈≈≈≈≈≈≈≈≈≈████▒██▒▒▒██████▒▒█▒▒██≈≈≈
≈≈≈≈≈≈≈≈≈≈≈≈██▒▒▒█▒▒▒██████▒▒█▒▒██≈≈≈
≈≈≈≈≈≈≈≈≈≈≈≈██▒▒▒█▒▒▒██████▒▒█▒▒█≈≈≈≈
≈≈≈≈≈≈≈≈≈≈≈≈██▒▒▒█▒▒▒██████▒▒█▒▒█≈≈≈≈
≈≈≈≈≈≈≈≈≈≈≈≈≈██▒██▒▒▒▒████▒▒▒█▒█≈≈≈≈≈
≈≈≈≈≈≈≈≈≈≈≈≈████▒▒▒▒▒▒▒▒▒▒▒▒▒▒██≈≈≈≈≈
≈≈≈≈≈≈≈≈≈≈██████▒▒▒▒▒▒▒▒▒▒▒▒▒██≈≈≈≈≈≈
≈≈≈≈≈≈≈≈≈≈██▒▒▒▒█▒▒▒▒▒▒▒▒▒▒▒█████≈≈≈≈
≈≈≈≈≈≈≈≈≈███▒▒▒▒▒██▒▒▒▒▒▒▒██▒▒▒███≈≈≈
≈≈≈≈≈≈≈≈≈≈█▒▒▒▒▒▒██████████▒▒▒▒▒██≈≈≈
≈≈≈≈≈≈≈≈≈≈██▒▒▒▒▒▒█████████▒▒▒▒▒██≈≈≈
≈≈≈≈≈≈≈≈≈████▒▒▒▒▒█████████▒▒▒▒██≈≈≈≈
≈≈≈≈≈≈≈≈███████▒▒▒███▒████▒▒▒▒██≈≈≈≈≈
≈≈≈≈≈≈███████████▒▒██▒▒▒█▒▒▒███≈≈≈≈≈≈
≈≈≈≈≈██████████▒▒▒▒█▒▒▒▒█▒███≈≈≈≈≈≈≈≈
≈≈≈≈███████████▒▒▒▒▒▒▒▒▒▒▒██≈≈≈≈≈≈≈≈≈
≈≈≈≈████████≈≈██▒▒▒▒▒▒▒▒▒▒█≈≈≈≈≈≈≈≈≈≈
≈≈≈≈≈██████≈≈███▒▒▒▒▒▒▒▒▒▒█≈≈≈≈≈≈≈≈≈≈
≈≈≈≈≈≈████≈≈██▒▒█▒▒▒▒▒▒▒▒▒█≈≈≈≈≈≈≈≈≈≈
≈≈≈≈≈≈███≈≈██▒▒▒▒█▒▒▒▒▒▒▒██≈≈≈≈≈≈≈≈≈≈
≈≈≈≈≈≈≈≈≈≈≈██▒▒▒▒████▒▒▒█▒█≈≈≈≈≈≈≈≈≈≈
≈≈≈≈≈≈≈≈≈≈≈█▒▒▒▒▒█≈≈████▒▒██≈≈≈≈≈≈≈≈≈
≈≈≈≈≈≈≈≈≈≈≈█▒█▒█▒█≈≈≈≈█▒▒▒▒█≈≈≈≈≈≈≈≈≈
≈≈≈≈≈≈≈≈≈≈≈≈█████≈≈≈≈≈█▒▒▒▒█≈≈≈≈≈≈≈≈≈
≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈█▒▒▒▒█≈≈≈≈≈≈≈≈≈
≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈█▒▒▒▒█≈≈≈≈≈≈≈≈≈
≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈█▒█▒█≈≈≈≈≈≈≈≈≈
≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈███≈≈≈≈≈≈≈≈≈≈
            `; 
            this.RenderFile.push(file);
        }
    }
  }
}
 /*
  * Tree
  * SubClass for storing render related structure
  * @author Andrew Mitchem (1810-Oct08-Java-USF)
  */
class Tree {
  name: string;
  files: File[] = [];
  tree: Tree[] = [];
}
 /*
  * RenderFile
  * SubClass for storing render related structure
  * @author Andrew Mitchem (1810-Oct08-Java-USF)
  */
class RenderFile {
  fileName: String;
  fileContent: String;
}