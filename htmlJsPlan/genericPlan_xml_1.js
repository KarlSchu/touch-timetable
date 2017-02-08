/**
*/
var days = ['Mo','Di','Mi','Do','Fr'];
var headline = ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag']
var dayCols = 3;
var tableRows = 11;
var autoRefresh = false;
var calculatedLessons;
var calculatedTeachersLessons;
var countedLessons;
var calculatedGroups;
var ubId = 'unbesetztId';

var xmlPlanDefFile = 'plandef.xml';
var xmlPlanFile = 'plandata.xml';
var xmlPlanDefString;
var xmlPlanString;
var xmlDoc;
var xmlhttp;
var log = '';
// daten aus xml file:
var colsPerDay;
var rowsInPlan;
var topics;
var teachers;
var groups;
var lines;

// ---------------------------------------------------------------------------
String.prototype.trim = function() {
  // Erst fuehrende, dann Abschliessende Whitespaces entfernen
  // und das Ergebnis dieser Operationen zurueckliefern
  return this.replace (/^\s+/, '').replace (/\s+$/, '');
}
// -------- DataTypes ---------------------------------------------------------------------
function Topic(id, node){
  this.id = id;
  this.descr = node.selectSingleNode('./descr').textContent;
  this.style = node.selectSingleNode('./style').textContent;
}
Topic.prototype.type="Topic";

function Teacher(id, node){
  this.id = id;
  this.descr = node.selectSingleNode('./descr').textContent;
  this.style = node.selectSingleNode('./style').textContent;
}
Teacher.prototype.type="Teacher";

function Group(id, node){
  this.id = id;
  this.members = node.selectSingleNode('./members').textContent;
  this.descr = node.selectSingleNode('./descr').textContent;
  this.style = node.selectSingleNode('./style').textContent;
}
Group.prototype.type="Group";

function Line(node){
  this.id = node.selectSingleNode('./@id').nodeValue;
  this.style = node.selectSingleNode('./style').textContent;
  this.scedule = node.selectSingleNode('./scedule').textContent;
  this.days = new Array();
}
Line.prototype.type="Line";

function Day(node){
  this.id = node.selectSingleNode('./@id').nodeValue;
  this.atoms = new Array();
}
Day.prototype.type="Day";

function Atom(element){
  this.topicId = '';
  this.groupIds = new Array();
  this.teacherIds = new Array();
  if (element != null) {
    this.topicId = element.selectSingleNode('./topic').textContent;
    var gNode = element.selectSingleNode('./groups');
    if (gNode != null && gNode.textContent.length > 0)
      this.groupIds = element.selectSingleNode('./groups').textContent.trim().split(/[,; \n]+/);
    var tNode = element.selectSingleNode('./teachers');
    if (tNode != null && tNode.textContent.length > 0)
      this.teacherIds = tNode.textContent.trim().split(/[,; \n]+/);
  }
}
Atom.prototype.type="Atom";

Atom.prototype.hasGroup=function(/*:String*/ groupId) {
  for (var i in this.groupIds) {
    if (this.groupIds[i]==groupId)
      return true;
  }
  return false;
}

// ---------Helper ----------------------------------------------------
function printException(/*:Exception*/ e) {
  var msg = '';
  msg = '\nFehler beim Einlesen des XPDL Strings:\n' + e;
  msg += '\nFile: '+ e.fileName + ': ' + e.lineNumber + '\n';
  msg += 'Msg: '+ e.message + '\n';
  if (typeof(e.stack) == "string") {
    msg += 'Stack:\n'+ e.stack.replace('\\"','"','g').replace('\\r','','g').replace('\\n','\n','g').replace('\\','','g') + '\n';
  }
  return msg;
}

function makeNodeFromString(/*:String*/ xml, /*:String*/ path) {
  try {
    var xpdlDoc = new DOMParser().parseFromString(xml, 'text/xml');
    if(Sarissa.getParseErrorText(xpdlDoc) != Sarissa.PARSED_OK){
      penta.log('Error:\n' + Sarissa.getParseErrorText(xpdlDoc));
      return null;
    }
    if (navigator.appName.toUpperCase() == 'MICROSOFT INTERNET EXPLORER') {
      xpdlDoc.setProperty('SelectionLanguage', 'XPath');  // allow XPath for IE
      xpdlDoc.setProperty('SelectionNamespaces', this.ns);
    }
    return xpdlDoc.selectSingleNode(path);
  } catch(e) {
    logger('\nFehler beim Einlesen des XPDL Strings:\n'
    + xml + '\n\n'
    + 'Msg: '+ e.message + '\n'
    //~ + 'Stack:\n'+ e.stack.replace('\\"','"','g').replace('\\n','\n','g') + '\n'
    );
  }
  return null;
}
/** #*
 * Logt in die Konsole des Browsers, falls es eine solche gibt.
 *# */
function logger(message, stacktrace) {
  if (window.console) {
    if (stacktrace && window.console.trace) window.console.trace();
    window.console.log(message);
  } else if (window.opera && window.opera.postError) {
    window.opera.postError(message);
  } else {
    var debug = document.getElementById("PgConsole");
    if (debug) {
      var contents = message + "<br/>" + debug.innerHTML;
      if (contents.length > 2048) contents = contents.substring(0, 2048);
      debug.innerHTML = contents;
    }
  }
}

// -------- XML Reader -------------------------------------------------------------------
function readPlanDef() {
  xmlhttp = new XMLHttpRequest();    
  try {
    xmlhttp.open("GET", xmlPlanDefFile, false);  
    xmlhttp.send('');  
    xmlPlanDefString = new XMLSerializer().serializeToString(xmlhttp.responseXML);
  } catch(e) {
      log = 'Fehler beim Einlesen des PlanDefFiles:\n'
    + 'File: '+ e.fileName + '\n'
    + 'Line: '+ e.lineNumber + '\n'
    + 'Msg: '+ e.message + '\n'
    + 'Stack:\n'+ e.stack.replace('\\"','"','g').replace('\\n','\n','g') + '\n'
    ;
    alert(log);
  }
  parsePlanDef();
  initTopics();
  initTeachers();
  initGroups();
}

function readPlan() {
  xmlhttp = new XMLHttpRequest();    
  try {
    xmlPlanFile = document.getElementById('planFileName').value;
    xmlhttp.open("GET", xmlPlanFile, false);  
    xmlhttp.send('');  
    xmlPlanString = new XMLSerializer().serializeToString(xmlhttp.responseXML);
  } catch(e) {
      log = 'Fehler beim Einlesen des PlanFiles:\n'
    + 'File: '+ e.fileName + '\n'
    + 'Line: '+ e.lineNumber + '\n'
    + 'Msg: '+ e.message + '\n'
    + 'Stack:\n'+ e.stack.replace('\\"','"','g').replace('\\n','\n','g') + '\n'
    ;
    alert(log);
  }
  parsePlan();
  atoms2plan();
}

function parsePlanDef() {
  var parser = new DOMParser();
  var log ='';
  var nodes;

  try {
    xmlDoc = parser.parseFromString(xmlPlanDefString, 'text/xml');
    if(Sarissa.getParseErrorText(xmlDoc) != Sarissa.PARSED_OK){
      log = 'Error:\n' + Sarissa.getParseErrorText(xmlDoc);
      alert(log);
      return log;
    }
    if (navigator.appName.toUpperCase() == 'MICROSOFT INTERNET EXPLORER') {
      xmlDoc.setProperty('SelectionLanguage', 'XPath');  // allow XPath for IE
      this.ns = 'xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"';
      // or: 
      this.ns = 'xmlns:xsl="http://www.w3.org/1999/XSL/Transform"';
    }
    xmlDoc.setProperty('SelectionNamespaces', this.ns);

    // parse topicDefs
    log += 'parse topics\n';
    nodes = xmlDoc.selectNodes('//planDef/topicDefs/*');
    topics = new Object();
    for (var i=0; i < nodes.length; i++) {
      var id = nodes[i].getAttribute("id");
      //var value = nodes[i].selectSingleNode('./name').textContent;
      topics[id] = new Topic(id, nodes[i]);
    }    
    // parse teacherDefs
    log += 'parse teachers\n';
    nodes = xmlDoc.selectNodes('//planDef/teacherDefs/*');
    teachers = new Object();
    for (var i=0; i < nodes.length; i++) {
      var id = nodes[i].getAttribute("id");
      teachers[id] = new Teacher(id, nodes[i]);
    }    
    // parse groupDefs
    log += 'parse groups\n';
    nodes = xmlDoc.selectNodes('//planDef/groupDefs/*');
    groups = new Object();
    for (var i=0; i < nodes.length; i++) {
      var id = nodes[i].getAttribute("id");
      groups[id] = new Group(id, nodes[i]);
    }  
    log = '';
  } catch(e) {
    log += '\nFehler beim Einlesen des PlanDefinition Strings:\n'
    + 'File: '+ e.fileName + '\n'
    + 'Line: '+ e.lineNumber + '\n'
    + 'Msg: '+ e.message + '\n'
    + 'Stack:\n'+ e.stack.replace('\\"','"','g').replace('\\n','\n','g') + '\n'
    ;
  }
  logger(log);
  if (log.length > 0 )
    alert(log);
}

function parsePlan() {
  var parser = new DOMParser();
  var log ='';
  var nodes;

  try {
    xmlDoc = parser.parseFromString(xmlPlanString, 'text/xml');
    if(Sarissa.getParseErrorText(xmlDoc) != Sarissa.PARSED_OK){
      log = 'Error:\n' + Sarissa.getParseErrorText(xmlDoc);
      alert(log);
      return log;
    }
    if (navigator.appName.toUpperCase() == 'MICROSOFT INTERNET EXPLORER') {
      xmlDoc.setProperty('SelectionLanguage', 'XPath');  // allow XPath for IE
      this.ns = 'xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"';
      // or: 
      this.ns = 'xmlns:xsl="http://www.w3.org/1999/XSL/Transform"';
    }
    xmlDoc.setProperty('SelectionNamespaces', this.ns);


    // parse table: lines, days and atoms
    log += 'parse topics\n';
    colsPerDay = xmlDoc.selectSingleNode('//plan/table/@colsPerDay').nodeValue;
    rowsInPlan = xmlDoc.selectSingleNode('//plan/table/@rowsInPlan').nodeValue;
    var lineNodes = xmlDoc.selectNodes('//plan/table/*');
    lines = new Array();
    for (var i=0; i < lineNodes.length; i++) {
      var line = new Line(lineNodes[i]);
      lines.push(line);
      var dayNodes = lineNodes[i].selectNodes('./days/*');  
      for (var j=0; j < dayNodes.length; j++) {
        var day = new Day(dayNodes[j]);
        line.days.push(day);
        var atomNodes = dayNodes[j].selectNodes('./*');  
        for (var k=0; k < atomNodes.length; k++) {
          var atom = new Atom(atomNodes[k]);
          day.atoms.push(atom);
        }
      }
//      var id = nodes[i].getAttribute("id");
//      groups[id] = new Group(id, nodes[i]);
    }  
    log = '';
  } catch(e) {
    log += '\nFehler beim Einlesen des Plan Strings:\n'
    + 'File: '+ e.fileName + '\n'
    + 'Line: '+ e.lineNumber + '\n'
    + 'Msg: '+ e.message + '\n'
    + 'Stack:\n'+ e.stack.replace('\\"','"','g').replace('\\n','\n','g') + '\n'
    ;
  }
  logger(log);
  if (log.length > 0 )
    alert(log);
    
  //alert(new XMLSerializer())
}

// -------- INIT Metainfos -------------------------------------------------------------------
function initTopics() {
  var s = '';
  for (var e in topics) {
    s += '<li><strong style="background-color:'+topics[e].style+'">' + topics[e].id + '</strong>: ' + topics[e].descr + '</li>';
  }
  document.getElementById('topicDefs').innerHTML = 'Faecher: <ul>' + s + '</ul>';
}

function initTeachers() {
  var s = '';
  for (var e in teachers) {
    s += '<li><strong style="border:'+teachers[e].style+'">' + teachers[e].id + '</strong>: ' + teachers[e].descr;
  }
  document.getElementById('teacherDefs').innerHTML = 'Lehrer: <ul>' + s + '</ul>';
}

function initGroups() {
  var s = '';
  var l = '';
  for (var e in groups) {
    s += '<li><strong style="">' + groups[e].id + '</strong>: (' + groups[e].descr + ') ' + groups[e].members + '</li>';
    l += groups[e].id + ' ';
  }
  document.getElementById('groupDefs').innerHTML = 'Gruppen:<ul>' + s + '</ul>';
  document.getElementById('groups').value = l;
}

// --------------------------------------------------------------------------
/**
  * Ausgabestundenplaene fuer die Gruppen generieren 
  */
function initEditPlan() {
  tableRows = document.getElementById('tableRows').value;
  dayCols = document.getElementById('dayCols').value;
  var tr; 
  var td;    
  var ta;
  var entry = document.getElementById('inPlan');  
  entry.innerHTML = '';
  entry.className = 'in';
  var comment = document.createTextNode('Plandata');
  comment.className='outTag';
  entry.appendChild(comment);
  var table = document.createElement('table');
  table.id = 'plan';
  entry.appendChild(table);
  table.className = 'inPlan';
  tr = document.createElement('tr');
  table.appendChild(tr);
  td = document.createElement('td');
  tr.appendChild(td);
  td.className = 'outStyle';
  td.innerHTML = 'H';
  td = document.createElement('td');
  tr.appendChild(td);
  td.className = 'time';
  td.innerHTML = 'Zeiten';
  for (var day in headline) {
    td = document.createElement('td');
    tr.appendChild(td);
    td.className = 'tag';
    td.innerHTML = headline[day];
    td.colSpan = dayCols;
  }
  var id;
  for (var row = 1; row <= tableRows; row++) {
      var tr = document.createElement('tr');
      table.appendChild(tr);
      var td = document.createElement('td');
      tr.appendChild(td);
      td.className = 'style';
      var ta = document.createElement('textarea');
      td.appendChild(ta);
      id = 'Style_'+row;
      ta.id = id;
      ta.name = id;
      ta.className = 'style';
      
      td = document.createElement('td');
      tr.appendChild(td);
      td.className = 'time';
      ta = document.createElement('textarea');
      td.appendChild(ta);
      id = 'Time_'+row;
      ta.id = id;
      ta.name = id;
      ta.className = 'time';
      
      for (var day in days) {
        for (var col = 1; col <= dayCols; col++) {              
          id = days[day]+'_'+row+'_'+col;
          var td = document.createElement('td');
          tr.appendChild(td);
          if (col < dayCols)
            td.className = 'atom';
          else
            td.className = 'atomR';
          var ta = document.createElement('textarea');
          td.appendChild(ta);
          ta.id = id;
          ta.name = id;
          ta.className = 'atom';
          ta.onblur = function(){
            setAtom(this);
          }
        }
     }
  }
}
/**
 * atoms in PLan eintragen
 **/
function atoms2plan() {
  var f;
  var log = '';
  for (var i in lines) {
    var line = lines[i];
    f = document.getElementById('Style_'+line.id);
    if (f != null)
      f.value = line.style;
    f = document.getElementById('Time_'+line.id);
    if (f != null)
      f.value = line.scedule;
    for (var j in line.days) {
      var day = line.days[j];
      for (var k in day.atoms) {
        var atom = day.atoms[k];
        var nr = eval(k+'+1');
        var id = day.id+'_'+line.id+'_'+nr;
        f = document.getElementById(id);
        if (f != null) {
          var t = '';
          var value = atom.topicId;
          for (var l in atom.groupIds) {
            t += ' '+ atom.groupIds[l];
          }
          if (t.length > 0) {
            value += ' ' + t;
          }
          t = '';
          for (var l in atom.teacherIds) {
            t += ' '+ atom.teacherIds[l];
          }
          if (t.length > 0) {
            value += ' ' + t;
          }
          f.value = value;
        } else {
          log += 'Element "'+id+'" nicht gefunden\n';
        }
      }
    }
  }
  if (log.length > 0) {
    alert(log);
  }
}

/**
  * plan -> Transfer
  */
function plan2transfer() {
  if (autoRefresh == false)
    return;
  var error = ''; 
  var xml = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n'
          + '<plan>\n'
          + '  <table colsPerDay="3" rowsInPlan="15">\n';
  
  for (var row = 1; row <= tableRows; row++) {
    var lineXml = '';
    var style = document.getElementById('Style_'+row).value;
    var time = document.getElementById('Time_'+row).value;
    for (var day in days) {
      var atomXml = '';
      for (var col = 1; col <= dayCols; col++) {
        var id = days[day]+'_'+row+'_'+col;
        var atom = parseAtom(document.getElementById(id));
        if (atom != null) {
          atomXml += '          <atom>\n'
          atomXml += '            <topic>' + atom.topicId + '</topic>\n';
          if (atom.groupIds.length > 0) {
              atomXml += '            <groups>' + atom.groupIds + '</groups>\n';
          }
          if (atom.teacherIds.length > 0) {
              atomXml += '            <teachers>' + atom.teacherIds + '</teachers>\n';
          }
          atomXml += '          </atom>\n';
        }
      }
      if (atomXml.length > 0) {
        lineXml += '        <day id="'+days[day]+'">\n' + atomXml + '        </day>\n';
      }
    }
    if (style.length > 0 || time.length > 0 || lineXml.length > 0) {
      xml += '    <line id="' + row + '">\n';
      xml += '      <style>' + style +'</style>\n';
      xml += '      <scedule>' + time +'</scedule>\n';
    } 
    if (lineXml.length > 0) {
      xml += '      <days>\n' + lineXml + '      </days>\n';
    }
    if (style.length > 0 || time.length > 0 || lineXml.length > 0) {
      xml += '    </line>\n';
    }
  }
  
  xml += '  </table>\n'
       + '</plan>\n';

  if (error.length > 0) {
    alert('Fehler beim Refresh des/der Elements/e:\n'+error); 
  }
  document.getElementById('transfer').value = xml;
}

function parseAtom(elem) {
  try {
    var value = elem.value;
    if (value.length == 0) {
      return null;
    }
    var all = value.split(/[,; \n]+/);
    if (all.length == 0) {
      return null;
    }
    var atom = new Atom(null);
    atom.topicId = all[0];
    for (var i=1; i < all.length; i++) {
      if (all[i].length > 0) {
        if (all[i][0] < 'a') {
          atom.groupIds.push(all[i]);
        } else {
          atom.teacherIds.push(all[i]);
        }
      }
    }
    return atom;
  } catch (e)  {
    ;
  }
  return null;
}

function setAtom(elem) {
  var atom = parseAtom(elem);
  elem.style.backgroundColor = 'white';
  elem.style.border = '1px solid lightgray';
  if (atom != null) {
     if (typeof(topics[atom.topicId]) != 'undefined') {
      elem.style.backgroundColor = topics[atom.topicId].style;
     }
     if (atom.teacherIds.length > 0 && typeof(teachers[atom.teacherIds[0]]) != 'undefined') {
      elem.style.border = teachers[atom.teacherIds[0]].style;
     }
 }
 plan2transfer();
}

/**
  * Reset all Colors and Frames
  */
function refreshAllAtoms() {
  autoRefresh = false;
  var error = ''; 
  var log = '';
  for (var row = 1; row <= tableRows; row++) {
    for (var day in days) {
      for (var col = 1; col <= dayCols; col++) {
        var id = days[day]+'_'+row+'_'+col;
        try {
          setAtom(document.getElementById(id));
          } catch (e)  {
            error += id + '\n';  
          }
      }
    }
  }
  if (error.length > 0) {
    alert('Fehler beim Refresh des/der Elements/e:\n'+error); 
  }
  autoRefresh = true;
}

// ----------- Auswertungsfunktionen ---------------------------------------------------------------
/**
  * Berechnung der Lehrerstundenanzahlen - Worker 
  */
function calculateLessonsWorker(elem) {
  var atom = parseAtom(elem);
  if (atom != null && atom.topicId != '.') {
    if (calculatedLessons[atom.topicId] == null) {
      calculatedLessons[atom.topicId] = 0;
    }
    calculatedLessons[atom.topicId]++;
  }
}
/**
  * Berechnung der Fachstundenanzahlen
  */
function calculateLessons() {
  calculatedLessons = new Object();
  var summe = 0;
  allCellFactory(calculateLessonsWorker);
  var tr; 
  var td;    
  var entry = document.getElementById('outputLessons');  
  entry.innerHTML = '';
  entry.className = 'out';
  var table = document.createElement('table');
  entry.appendChild(table);
  table.className = 'outCalc';
  tr = document.createElement('tr');
  table.appendChild(tr);
  td = document.createElement('th');
  tr.appendChild(td);
  td.innerHTML = 'Fach';
  td = document.createElement('th');
  tr.appendChild(td);
  td.innerHTML = 'Stundenzahl';
  for (var lesson in calculatedLessons) {
    tr = document.createElement('tr');
    table.appendChild(tr);
    td = document.createElement('td');
    tr.appendChild(td);
    td.className = 'outTime';
    td.innerHTML = lesson;
    td = document.createElement('td');
    tr.appendChild(td);
    td.className = 'outTime';
    td.innerHTML = calculatedLessons[lesson];
    summe += calculatedLessons[lesson];
  }
  tr = document.createElement('tr');
  table.appendChild(tr);
  td = document.createElement('td');
  tr.appendChild(td);
  td.className = 'outTime';
  td.innerHTML = '<b>Summe Fachstunden</b>';
  td = document.createElement('td');
  tr.appendChild(td);
  td.className = 'outTime';
  td.innerHTML = '<b>'+summe+'</b>';
}
/**
  * Berechnung der Gruppenstundenanzahlen - Worker
  */
function calculateTeacherLessonsWorker(elem) {
  var atom = parseAtom(elem);
  if (atom != null && atom.topicId != '.') {
    countedLessons++;
    for (var i=0; i < atom.teacherIds.length; i++) {
      if (calculatedTeacherLessons[atom.teacherIds[i]] == null) {
        calculatedTeacherLessons[atom.teacherIds[i]] = 0;
      }
      calculatedTeacherLessons[atom.teacherIds[i]]++;
    }
  }
}
/**
  * Berechnung der Lehrerstundenanzahlen
  */
function calculateTeacherLessons() {
  countedLessons = 0;
  calculatedTeacherLessons = new Object();
  var summe = 0;
  var summeUnb = 0;
  allCellFactory(calculateTeacherLessonsWorker);
  var tr; 
  var td;    
  var entry = document.getElementById('outputTeachers');  
  entry.innerHTML = '';
  entry.className = 'out';
  var table = document.createElement('table');
  entry.appendChild(table);
  table.className = 'outCalc';
  tr = document.createElement('tr');
  table.appendChild(tr);
  td = document.createElement('th');
  tr.appendChild(td);
  td.innerHTML = 'Lehrer';
  td = document.createElement('th');
  tr.appendChild(td);
  td.innerHTML = 'Stundenzahl';
  for (var lesson in calculatedTeacherLessons) {
    if (lesson == ubId) {
      summeUnb += calculatedTeacherLessons[lesson];
    } else {
      tr = document.createElement('tr');
      table.appendChild(tr);
      td = document.createElement('td');
      tr.appendChild(td);
      td.className = 'outTime';
      td.innerHTML = lesson;
      summe += calculatedTeacherLessons[lesson];
      td = document.createElement('td');
      tr.appendChild(td);
      td.className = 'outTime';
      td.innerHTML = calculatedTeacherLessons[lesson];
    }
  }
  tr = document.createElement('tr');
  table.appendChild(tr);
  td = document.createElement('td');
  tr.appendChild(td);
  td.className = 'outTime';
  td.innerHTML = '<b>Lektionen mit Lehrer</b>';
  td = document.createElement('td');
  tr.appendChild(td);
  td.className = 'outTime';
  td.innerHTML = '<b>'+summe+'</b>';
  tr = document.createElement('tr');
  table.appendChild(tr);
  td = document.createElement('td');
  tr.appendChild(td);
  td.className = 'outTime';
  td.innerHTML = '<b>Lektionen gesamt</b>';
  td = document.createElement('td');
  tr.appendChild(td);
  td.className = 'outTime';
  //td.innerHTML = '<b>'+summeUnb +'</b>';
  td.innerHTML = '<b>'+countedLessons +'</b>';
  }

/**
  * Berechnung der Gruppenstundenanzahlen - Worker
  */
function calculateGroupLessonsWorker(elem) {
  var atom = parseAtom(elem);
  if (atom != null && atom.topicId != '.') {  
    countedLessons++;
    for (var i=0; i < atom.groupIds.length; i++) {
      if (calculatedGroups[atom.groupIds[i]] == null) {
        calculatedGroups[atom.groupIds[i]] = 0;
      }
      calculatedGroups[atom.groupIds[i]]++;
    }
  }
}

/**
  * Berechnung der Gruppenstundenanzahlen
  */
function calculateGroupLessons() {
  countedLessons = 0;
  calculatedGroups = new Object();
  var summe = 0;
  var summeUnb = 0;
  allCellFactory(calculateGroupLessonsWorker);
  var tr; 
  var td;    
  var entry = document.getElementById('outputGroups');  
  entry.innerHTML = '';
  entry.className = 'out';
  var table = document.createElement('table');
  entry.appendChild(table);
  table.className = 'outCalc';
  tr = document.createElement('tr');
  table.appendChild(tr);
  td = document.createElement('th');
  tr.appendChild(td);
  td.innerHTML = 'Gruppe';
  td = document.createElement('th');
  tr.appendChild(td);
  td.innerHTML = 'Stundenzahl';
  for (var lesson in calculatedGroups) {
    if (lesson == ubId) {
      summeUnb += calculatedGroups[lesson];
    } else {
      tr = document.createElement('tr');
      table.appendChild(tr);
      td = document.createElement('td');
      tr.appendChild(td);
      td.className = 'outTime';
      td.innerHTML = lesson;
      summe += calculatedGroups[lesson];
      td = document.createElement('td');
      tr.appendChild(td);
      td.className = 'outTime';
      td.innerHTML = calculatedGroups[lesson];
    }
  }
  tr = document.createElement('tr');
  table.appendChild(tr);
  td = document.createElement('td');
  tr.appendChild(td);
  td.className = 'outTime';
  td.innerHTML = '<b>Lektionen mit Gruppenzuteilung</b>';
  td = document.createElement('td');
  tr.appendChild(td);
  td.className = 'outTime';
  td.innerHTML = '<b>'+summe+'</b>';
  tr = document.createElement('tr');
  table.appendChild(tr);
  td = document.createElement('td');
  tr.appendChild(td);
  td.className = 'outTime';
  td.innerHTML = '<b>Lektionen gesamt</b>';
  td = document.createElement('td');
  tr.appendChild(td);
  td.className = 'outTime';
  //td.innerHTML = '<b>'+summeUnb +'</b>';
  td.innerHTML = '<b>'+countedLessons +'</b>';
  }

function allCellFactory(/*:function*/ worker) {
  var error = ''; 
  for (var row = 1; row <= tableRows; row++) {
    for (var day in days) {
      for (var col = 1; col <= dayCols; col++) {
        var id = days[day]+'_'+row+'_'+col;
        try {
           worker(document.getElementById(id));
          } catch (e)  {
            error += id + '\n';  
          }
      }
    }
  }
  if (error.length > 0) {
    alert('Fehler bei allCellFactory des/der Elements/e:\n'+error); 
  }
}

function clearView() {
  var entry = document.getElementById('outputPlans');  
  entry.innerHTML = '';
}

function generateViews() {
   var groups = document.getElementById('groups').value.trim().split(/[,; ]/);
   for (var group in groups) {
    generateView(groups[group]);
  }
}

/**
  * Ausgabestundenplaene fuer die Gruppen generieren 
  */
function generateView(group) {
  var tr; 
  var td;    
  var entry = document.getElementById('outputPlans');  
  entry.className = 'out';
  entry.appendChild(document.createElement('br'));
  var outGroup = document.createElement('div');
  entry.appendChild(outGroup);
  outGroup.className='outGroup';
  var commentText = 'Gruppe: ' + group;
  if (document.getElementById('printGroupMembers').checked && typeof(groups[group]) != 'undefined')
    commentText += ' ('+ groups[group].members +')';
  var comment = document.createTextNode(commentText);
  comment.className='outTag';
  entry.appendChild(comment);
  var table = document.createElement('table');
  entry.appendChild(table);
  table.className = 'out';
  tr = document.createElement('tr');
  table.appendChild(tr);
  td = document.createElement('td');
  tr.appendChild(td);
  td.className = 'outTime';
  td.innerHTML = 'Zeiten';
  for (var day in headline) {
    td = document.createElement('td');
    tr.appendChild(td);
    td.className = 'outTag';
    td.innerHTML = headline[day];
  }
  td = document.createElement('td');
  tr.appendChild(td);
  td.style.border = '1px solid white';
  td.innerHTML = '&nbsp;';
  var elem;
  for (var row = 1; row <= tableRows; row++) {
      var rowStyle = document.getElementById('Style_'+row).value;
      if (rowStyle == 0) {
        continue;
      }
      tr = document.createElement('tr');
      table.appendChild(tr);
      td = document.createElement('td');
      tr.appendChild(td);
      td.className = 'outTime';
      td.innerHTML = document.getElementById('Time_'+row).value;
      for (var day in days) {
        td = document.createElement('td');
        tr.appendChild(td);
        td.innerHTML = '&nbsp;';
        td.className = 'outAtom';
        td.style.height = rowStyle;
        var groupFound = false;
        for (var col = 1; col <= dayCols; col++) {
          var id = days[day]+'_'+row+'_'+col;
          elem = document.getElementById(id);
          var atom = parseAtom(elem);
          if (atom != null && atom.hasGroup(group)) {
            if (groupFound == true) {
              alert('Fehler im Feld "'+id+'": Eine Gruppe darf nur in einem Feld je Tag eingetragen sein!');
            }
            td.style.backgroundColor = elem.style.backgroundColor;
            td.style.border = '1px solid lightgray';
            var value = ''; 
            if (document.getElementById('printTopics').checked) {
              value += atom.topicId;
            }
            if (document.getElementById('printTeachers').checked) {
              if (value.lngth > 0) {
                value += ' ';
              }
              value += atom.teacherIds;
            }
            if (value.length == 0 && document.getElementById('printTeachers').checked) {
              value = atom.topicId;
            }
            td.innerHTML = value;
            groupFound = true;
          }
        }
     }
     td = document.createElement('td');
     tr.appendChild(td);
     td.style.border = '1px solid white';
     td.style.backgroundColor = 'white';
  }
}
