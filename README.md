# timetable PS
A timetabe for touch devices

Main purpose is to place lessons into a predefined timetable. It is not the idea to calculate or optimze automatically the lesson/room/teacher disposition. 

## Main Function
Add a lesson by drag it from the teachers list and droping it into the lesson table cell. 

If there are already an entry in the timetable cell the background becomes red. If you drop it 
nevertheless then the old content is replaced.  
You can drag timetable content from one cell to the other too. Then the default mode is "copy". 
By pressing the shift key (not on touch devices;) the cell content will be moved. 
![Timetable](/assets/timetableps-part.png)

## Counters
After each move the timtable countes are recalculated and the jason serialization of the 
timetable is stored in the local DB.

In the teachers table the lessons are counted per group.
In the groups table the lessons per group are sumerized.

## Additional cell data
By clicking at a cell with content an editor is opend to add subject, room and a flag for administrative 
entries (not printed in pupils plans).

## Administrative Functions
### Import and Upload
After an import the timetable is not directly saved into the local storage. Only after the next 
move resp. edit of the remark or legend field an autosave is performed.
### Export and Download
### Print
### Save
### Clear

## Tested with 
* Linux Mint and touch notebook
* Android mobile phone (lolipop)
* iPad Air

## Ideas / Feature Requests:
* marking of periods where a teacher has has more then one class.
* counters should be added to show
 * teacher lessons per period
 * teacher administrative lessons
 
