// timetable.js
//
/**
 * Should breaks count as teacher lesson or not.
 */
var countBreaksAsTeacherLessons = true;
/**
 * Should breaks count as group lessons or not.
 */
var countBreaksAsGroupLessons = true;
/**
 * The number of the lesson what is interpreted as the lunch break.
 */
var breakLessonNr = 6;
/**
 * Use background color for lessons or not, used for print mode.
 */
var coloredLessons = true;
/**
 * Default, code defined timeline for the lessons.
 */
var lessonDef = { // max: L0 to L9
    'L0': '7:30',
    'L1': '8:00',
    'L2': '',
    'L3': '10:15',
    'L4': '',
    'L5': '',
    'L6': '',
    'L7': '-15:00',
    'L8': '-16:00',
    'L9': '-17:00'
};
/**
 * Default, code defined definition of day.
 */
var dayDef = { //max mo - so
    'mo': 'Montag',
    'di': 'Dienstag',
    'mi': 'Mittwoch',
    'do': 'Donnerstag',
    'fr': 'Freitag' //,
        //'sa': 'Samstag'
};
/**
 * Default, code defined defintion of groups.
 * May be overwritten bei definition part of stored data or a 
 * group defintion string in the url.
 */
var groupDefDefault = { // max: A - Z
    'A': 'GrA1',
    'B': 'GrA2',
    'C': 'GrA3',
    'D': 'GrB',
    'E': 'GrC',
    //, 'F': 'Extra'
    //, 'G':'GGG'
    //, 'H':'HHH'
};
var groupDef = {};
/**
 * Default, code defined definition of teachers.
 */
var teacherDef = {
    'T0': 'KeS',
    'T1': 'KSC',
    'T2': 'UWO',
    'T3': 'SBO',
    'T4': 'CES',
    'T5': 'KRU',
    'T6': 'HME',
    'T7': 'SKU',
    'T8': 'AST',
    'T9': 'ISC',
    'T10': 'XXX',
    'T11': 'ASA'
};
/**
 * DateTime stammp of last data change.
 */
var timeStamp = "";

/**
 * Overwrites the default group definition with the groups in list.
 * @param {string} groupList 
 */
function setGroupDefinition(groupList) {
    if (groupList != undefined && groupList.length > 0) {
        groupList = groupList.replace(/\s*/g, '');
        var groups = groupList.split(',');
        $.each(groupDefDefault, function(groupId, groupName) {
            // if (groups.includes(groupId)) {
            //     groupDef[groupId] = groupName;
            // }
            if (groups.includes(groupName)) {
                groupDef[groupId] = groupName;
            }
        });
        coloredLessons = false;
    } else {
        groupDef = groupDefDefault;
    }
}

/**
 * Calls all the functions for DOM initializing.
 */
function initTimeTableGrid() {
    clearAllDo();
    initTeachersTable();
    initGroupsTable();
    initTimetableTable();
}

/**
 * Creates the DOM for teacher drag source table.
 */
function initTeachersTable() {
    var nodeTable = document.createElement("table");
    nodeTable.setAttribute('class', 'springLake');
    $("#teachers")[0].innerHTML = "";
    $("#teachers")[0].appendChild(nodeTable);
    var teacherNr = 0;
    var nodeTr;
    $.each(teacherDef, function(teacherKey, teacherValue) {
        if (teacherNr++ % 6 == 0) {
            nodeTr = document.createElement("tr");
            nodeTable.appendChild(nodeTr);
        }
        var nodeTd = document.createElement("td");
        nodeTr.append(nodeTd);
        var nodeDiv = document.createElement("div");
        nodeDiv.setAttribute('id', teacherKey);
        if (coloredLessons) {
            nodeDiv.setAttribute('class', 'spring colored');
        } else {
            nodeDiv.setAttribute('class', 'spring');
        }
        nodeDiv.setAttribute('draggable', 'true');
        nodeTd.appendChild(nodeDiv);
        var nodeDiv2 = document.createElement("div");
        nodeDiv.appendChild(nodeDiv2);
        //nodeDiv.setAttribute('admin', 'false');
        nodeDiv2.appendChild(document.createTextNode(teacherValue));
        nodeDiv.appendChild(document.createElement("div"));
        nodeDiv.appendChild(document.createElement("div"));
        $.each(groupDef, function(groupKey, groupValue) {
            var nodeSpan = document.createElement("span");
            nodeSpan.setAttribute('class', 'count');
            nodeSpan.setAttribute('id', teacherKey + 'G' + groupKey);
            nodeTd.append(nodeSpan);
        });
    });
}

/**
 * Creates the DOM for lesson and group sums table.
 */
function initGroupsTable() {
    nodeTable = document.createElement("table");
    nodeTable.setAttribute('class', 'groupsSum');
    // groupCount
    $("#groupCounters")[0].innerHTML = ""
    $("#groupCounters")[0].appendChild(nodeTable);
    var nodeTr;
    var nodeTd;
    var nodeSpan;
    var groupNr = 0;
    $.each(groupDef, function(groupKey, groupValue) {
        if (groupNr++ % 3 == 0) {
            nodeTr = document.createElement("tr");
            nodeTable.appendChild(nodeTr);
        }
        nodeTd = document.createElement("td");
        nodeTr.append(nodeTd);
        nodeSpan = document.createElement("a");
        nodeTd.appendChild(nodeSpan);
        nodeSpan.setAttribute('href', window.location.href.replace(/\?.*$/, '') + '?groups=' + groupValue);
        nodeSpan.setAttribute('target', 'blank');
        nodeSpan.setAttribute('class', 'count');
        nodeSpan.appendChild(document.createTextNode(groupValue + ': '));
        nodeSpan = document.createElement("span");
        nodeTd.appendChild(nodeSpan);
        nodeSpan.setAttribute('class', 'count');
        nodeSpan.setAttribute('id', 'Gr' + groupKey);
        nodeSpan.appendChild(document.createTextNode('_'));
    });
    for (var idx = groupNr; groupNr % 3 != 0; groupNr++) {
        nodeTd = document.createElement("td");
        nodeTr.append(nodeTd);
        nodeTd.appendChild(document.createTextNode('_'));
    }
    // lessonsCount
    nodeTr = document.createElement("tr");
    nodeTable.appendChild(nodeTr);
    nodeTd = document.createElement("td");
    nodeTr.append(nodeTd);
    nodeTd.setAttribute('colspan', 3);
    nodeTd.setAttribute('class', 'count');
    nodeSpan = document.createElement("span");
    nodeTd.appendChild(nodeSpan);
    nodeSpan.appendChild(document.createTextNode('Over all lessons: '));
    nodeSpan = document.createElement("span");
    nodeTd.appendChild(nodeSpan);
    nodeSpan.setAttribute('id', 'lessonsCount');
    nodeSpan.appendChild(document.createTextNode('_'));
}

/**
 * Init the timeline column and day containers.
 */
function initTimetableTable() {
    $("#timetable")[0].innerHTML = "";
    var nodeDiv = document.createElement("div");
    nodeDiv.setAttribute('class', 'timeline-container');
    var nodeHeader = document.createElement("header");
    nodeHeader.appendChild(document.createTextNode('Time'));
    nodeDiv.appendChild(nodeHeader);
    var nodeTable = document.createElement("table");
    nodeTable.setAttribute('class', 'springOcean');
    nodeDiv.appendChild(nodeTable);
    var nodeTr = document.createElement("tr");
    nodeTable.appendChild(nodeTr);
    var nodeTd = document.createElement("td");
    nodeTd.appendChild(document.createTextNode('#'));
    nodeTd.setAttribute('class', 'headerGroup');
    nodeTr.append(nodeTd);
    var lessonNr = 1;
    $.each(lessonDef, function(lessonKey, lessonValue) {
        nodeTr = document.createElement("tr");
        nodeTable.appendChild(nodeTr);
        var nodeClass = 'lesson';
        nodeTd = document.createElement("td");
        if (lessonNr == breakLessonNr) {
            nodeClass = 'dropLessonBreakTimeLine ' + nodeClass;
        }
        if (lessonKey == 'L0') {
            nodeClass = 'dropLessonEarly ' + nodeClass;
        }
        if (lessonNr < 5) {
            nodeClass += ' topAlign';
        } else {
            nodeClass += ' bottomAlign';
        }
        nodeTd.setAttribute('class', nodeClass);
        nodeTd.setAttribute('droppable', 'true');
        nodeTd.appendChild(document.createTextNode(lessonValue));
        nodeTr.append(nodeTd);
        nodeTable.appendChild(nodeTr);
        lessonNr++;
    });
    $("#timetable")[0].appendChild(nodeDiv);

    // whole week timetable
    $.each(dayDef, function(dayKey, dayValue) {
        var nodeDiv = document.createElement("div");
        nodeDiv.setAttribute('class', 'weekday-container');
        nodeDiv.setAttribute('id', dayKey);
        var nodeHeader = document.createElement("header");
        nodeHeader.appendChild(document.createTextNode(dayValue));
        nodeDiv.appendChild(nodeHeader);
        var nodeTable = document.createElement("table");
        nodeTable.setAttribute('class', 'springOcean');
        nodeDiv.appendChild(nodeTable);
        var nodeTr = document.createElement("tr");
        nodeTr.setAttribute('id', 'headerGroup_' + dayKey)
        nodeTable.appendChild(nodeTr);
        $.each(groupDef, function(groupKey, groupValue) {
            var nodeTd = document.createElement("td");
            nodeTd.appendChild(document.createTextNode(groupValue));
            nodeTd.setAttribute('class', 'headerGroup');
            nodeTr.append(nodeTd);
        });
        var lessonNr = 1;
        $.each(lessonDef, function(lessonKey, lessonValue) {
            nodeTr = document.createElement("tr");
            nodeTable.appendChild(nodeTr);
            $.each(groupDef, function(groupKey, groupValue) {
                nodeTd = document.createElement("td");
                nodeTd.setAttribute('id', dayKey + groupKey + lessonKey)
                var nodeClass = 'dropLesson';
                if (lessonNr == breakLessonNr) {
                    nodeClass = 'dropLessonBreak ' + nodeClass;
                } else if (lessonKey == 'L0') {
                    nodeClass = 'dropLessonEarly ' + nodeClass;
                }
                nodeTd.setAttribute('class', nodeClass);
                nodeTd.setAttribute('droppable', 'true');
                nodeTr.append(nodeTd);
            });
            nodeTable.appendChild(nodeTr);
            lessonNr++;
        });
        $("#timetable")[0].appendChild(nodeDiv);
    });
}

var editLesson = null;

/**
 * Initialize lesson input form with additional data form.
 * @param {*} event 
 */
function clickOnLesson(event) {
    var target = event.currentTarget;
    editLesson = event.currentTarget;
    var lessonId = target.parentNode.id;
    $("#fieldId").text(lessonId);
    $("#lessonNr").text(lessonId.replace(new RegExp(/([A-Z])L([0-9]+)/gmi), " \$2, Gr \$1"));
    $("#lessonNr").text($("#lessonNr").text().replace("mo", "Montag").replace("di", "Dienstag"));
    $("#teacher").text(target.children[0].innerHTML);
    $("#subject").val(target.children[1].innerHTML);
    $("#room").val(target.children[2].innerHTML);
    if (target.classList.contains('admin')) {
        $("#admin").prop('checked', true);
    }
}

/**
 * Take lesson edit form data into lesson
 * @param {*} event 
 */
function handleOk(event) {
    var fieldId = $("#fieldId").text();
    var field = $("#" + fieldId)[0];
    if ($("#admin").is(':checked')) {
        if (!editLesson.classList.contains("admin")) {
            editLesson.classList.add("admin");
        }
    } else {
        editLesson.classList.remove("admin");
    }
    field = $("#" + fieldId)[0].children[0];
    field.children[1].innerHTML = $("#subject").val();
    field.children[2].innerHTML = $("#room").val();
    saveData();
    editLesson = null;
}

/**
 * Create empty timetable structure.
 */
function createDayGroupLessonStructur() {
    var data = new Object();
    data.remarks = '';
    $.each(dayDef, function(dayKey, dayValue) {
        data[dayKey] = new Object();
        $.each(groupDef, function(groupKey, groupValue) {
            data[dayKey][groupKey] = new Object();
            $.each(lessonDef, function(lessonKey, lessonValue) {
                data[dayKey][groupKey][lessonKey] = '';
            });
        });
    });
    data.legend = '';
    return data;
}

/**
 * Get the definition, data part of the timetable and the version info from the DOM.
 */
function fetchAllFromDOM() {
    // create empty timetable
    var timeTable = new Object();
    timeTable.version = $("#version")[0].innerHTML;
    timeTable.lastChange = (new Date()).toString(); //$("#lastChange")[0].innerHTML;
    timeTable.definitions = fetchDefinitionFromDOM();
    timeTable.data = fetchDataFromDOM();
    return timeTable;
}

/**
 * Get the definition part of the timetable from the DOM.
 */
function fetchDefinitionFromDOM() {
    var definitions = new Object();
    definitions.dayDef = dayDef;
    definitions.groupDef = groupDef;
    definitions.lessonDef = lessonDef;
    definitions.teacherDef = teacherDef;
    return definitions;
}

/**
 * Get the data part of the timetable from th DOM.
 */
function fetchDataFromDOM() {
    var data = createDayGroupLessonStructur();
    data.remarks = $("#remarks").val();
    data.legend = $("#legend").val();
    $.each(dayDef, function(dayKey, dayValue) {
        $.each(groupDef, function(groupKey, groupValue) {
            $.each(lessonDef, function(lessonKey, lessonValue) {
                data[dayKey][groupKey][lessonKey] = '';
                var level1List = $("#" + dayKey + groupKey + lessonKey)
                if (level1List.length > 0) {
                    var level2List = level1List[0].childNodes;
                    if (level2List.length > 0) {
                        var content = new Object();
                        content.id = level2List[0].id;
                        content.teacher = level2List[0].children[0].innerHTML;
                        content.subject = level2List[0].children[1].innerHTML;
                        content.room = level2List[0].children[2].innerHTML;
                        content.admin = level2List[0].classList.contains("admin");
                        data[dayKey][groupKey][lessonKey] = content;
                    }
                }
            });
        });
    });
    return data;
}

/**
 * Reads definitions into dom, repaint table,
 * returns true if data are overwritten, else false
 * @param {*} timeTableDefinition 
 * @param {*} interactive 
 * @param {*} groupList 
 */
function reloadDefinitionsIntoDOM(timeTableDefinition, interactive, groupList) {
    if (timeTableDefinition.teacherDef != null ||
        timeTableDefinition.groupDef != null ||
        timeTableDefinition.dayDef != null ||
        timeTableDefinition.lessonDef != null) {
        if (!interactive || confirm("DEFINITIONS found. Overwrite current definition and data (clear all)?")) {
            var definitionsChanged = false;
            if (timeTableDefinition.teacherDef != null) {
                teacherDef = timeTableDefinition.teacherDef;
                definitionsChanged = true;
            }
            if (groupList != null) {
                setGroupDefinition(groupList);
            } else if (timeTableDefinition.groupDef != null) {
                groupDef = new Object();
                $.each(timeTableDefinition.groupDef, function(groupKey, groupValue) {
                    groupDef[groupKey] = groupValue;
                });
                definitionsChanged = true;
            }
            if (timeTableDefinition.dayDef != null) {
                dayDef = timeTableDefinition.dayDef;
                definitionsChanged = true;
            }
            if (timeTableDefinition.lessonDef != null) {
                lessonDef = timeTableDefinition.lessonDef;
                definitionsChanged = true;
            }
            if (definitionsChanged) {
                initTimeTableGrid();
                return true;
            }
        }
    }
    return false;
}

/**
 * 
 * @param {*} timeTable 
 * @param {*} interactive 
 */
function reloadDataIntoDOM(timeTable, interactive) {
    $("#remarks").val(timeTable.remarks);
    timeTable.remarks = $("#remarks").val();
    $("#legend").val(timeTable.legend);
    // if (timeTable.version != $("#version")[0].innerHTML) {
    //     if (!interactive) {
    //         alert('Version upgrade from ' + timeTable.version + ' to ' + $("#version")[0].innerHTML);
    //     }
    //     timeTable.version = $("#version")[0].innerHTML;
    // }
    $.each(dayDef, function(dayKey, dayValue) {
        $.each(groupDef, function(groupKey, groupValue) {
            $.each(lessonDef, function(lessonKey, lessonValue) {
                var target = $("#" + dayKey + groupKey + lessonKey)[0];
                if (target == undefined) {
                    alert("Error: Expected timetable element '" + dayKey + groupKey + lessonKey + "' not found!");
                } else if (target.className != null && target.className.match('.*' + 'dropLesson\\b.*')) {
                    if (timeTable == null) {
                        timeTable = createDayGroupLessonStructur();
                    }
                    if (timeTable[dayKey] != undefined &&
                        timeTable[dayKey][groupKey] != undefined &&
                        timeTable[dayKey][groupKey][lessonKey] != undefined &&
                        timeTable[dayKey][groupKey][lessonKey] != "") {
                        var teacherId = timeTable[dayKey][groupKey][lessonKey].id;
                        var teacherElem = $("#" + teacherId)[0];
                        if (teacherId != '') {
                            var teacherName = timeTable[dayKey][groupKey][lessonKey].teacher;
                            var subject = timeTable[dayKey][groupKey][lessonKey].subject;
                            var room = timeTable[dayKey][groupKey][lessonKey].room;
                            var admin = timeTable[dayKey][groupKey][lessonKey].admin;
                            while (target.childNodes.length > 0) {
                                target.removeChild(target.childNodes[0]);
                            }
                            var dupNode = teacherElem.cloneNode(true);
                            dupNode.style.opacity = "";
                            dupNode.style.cursor = "move";
                            dupNode.className = "teacherLesson";
                            if (coloredLessons) {
                                dupNode.setAttribute('class', 'teacherLesson colored');
                            } else {
                                dupNode.setAttribute('class', 'teacherLesson');
                            }
                            if (admin != null && admin) {
                                if (!dupNode.classList.contains("admin")) {
                                    dupNode.classList.add("admin");
                                }
                            } else {
                                dupNode.classList.remove("admin");
                            }
                            dupNode.children[0].innerHTML = timeTable[dayKey][groupKey][lessonKey].teacher;
                            dupNode.children[1].innerHTML = timeTable[dayKey][groupKey][lessonKey].subject;
                            dupNode.children[2].innerHTML = timeTable[dayKey][groupKey][lessonKey].room;
                            dupNode.addEventListener("click", function(event) {
                                clickOnLesson(event);
                                window.location.href = "#openModal";
                                $("#subject").focus();
                                //event.target.innerHTML = extendContent(event.target.innerHTML);
                            }, false);
                            target.appendChild(dupNode);
                        }
                    } //else {target.appendChild(document.createTextNode("x"));}
                }
            });
        });
    });
    recalcAll();
}

/**
 * Clear all timetable cells with confirmation.
 */
function clearAllAsk() {
    if (confirm("Clear all lesson entry from time table?")) {
        clearAllDo();
    }
}

/**
 * Clear all timetable cells, execution part.
 */
function clearAllDo() {
    var elements = $(".dropLesson");
    elements.each(function(idx, elem) {
        while (elem.childNodes.length > 0) {
            elem.removeChild(elem.childNodes[0]);
        }
    });
    $("#lastChange")[0].innerHTML = (new Date()).toString();
    recalcAll();
}

/**
 * Iterate through all timetable cells and add group and teacher and add lessons.
 */
function recalcAll() {
    var allLessonsCount = 0;
    var teachers = $(".spring");
    var elements = $(".dropLesson");
    // init teachers lessons count fields
    $.each(groupDef, function(groupKey, groupValue) {
        $("#Gr" + groupKey).text('-');
        $.each(teacherDef, function(teacherKey, teacherValue) {
            $("#" + teacherKey + "G" + groupKey).text('-');
        });
    });
    // init group counter fields
    var groupCounter = new Object();
    $.each(groupDef, function(groupKey, groupValue) {
        groupCounter[groupKey] = 0;
    });
    // claculate counters
    elements.each(function(idxDropLesson, dropLesson) {
        if (dropLesson.childNodes.length > 0) {
            var regExGroups = /..([A-Z])L([0-9])/.exec(dropLesson.id);
            if (regExGroups.length > 0) {
                var groupKey = regExGroups[1];
                var lessonNr = parseInt(regExGroups[2]);
                dropLesson.childNodes.forEach(function(child) {
                    $.each(teacherDef, function(teacherKey, teacherValue) {
                        if (child.id == teacherKey &&
                            (countBreaksAsTeacherLessons || lessonNr != breakLessonNr)) {
                            var lessons;
                            if (isNaN($("#" + teacherKey + "G" + groupKey).text())) {
                                lessons = 0;
                            } else {
                                lessons = parseInt($("#" + teacherKey + "G" + groupKey).text());
                            }
                            $("#" + teacherKey + "G" + groupKey).text(lessons + 1);
                        }
                    });
                    if (countBreaksAsGroupLessons || lessonNr != breakLessonNr) {
                        groupCounter[groupKey]++;
                    }
                });
                allLessonsCount++;
            }
        }
    });

    $("#lessonsCount").text(allLessonsCount);
    $.each(groupDef, function(groupKey, groupValue) {
        var elem = $("#Gr" + groupKey);
        if (elem != null) {
            elem.text(groupCounter[groupKey]);
        }
    });
}

/**
 * Check the version info from the timetable object and compare it with the code version.
 * @param {timeTable object} importData 
 */
function testVersion(importData) {
    if (importData.version != $("#version")[0].innerHTML) {
        alert('Version upgrade from ' + importData.version + ' to ' + $("#version")[0].innerHTML);
        importData.version = $("#version")[0].innerHTML;
    }
}

/**
 * Load timtable data from the browser local DB.
 * @param {*} groupList 
 */
function loadDataFromStore(groupList) {
    $("#importExportData").val('');
    timeTableString = localStorage.getItem("timeTablePs");
    importData = JSON.parse(timeTableString);
    testVersion(importData);
    if (importData == null || importData.definitions == null) {
        importData = createDayGroupLessonStructur();
        importData.definitions = fetchDefinitionFromDOM();
    }
    document.getElementById("importExportData").innerHTML = JSON.stringify(importData);
    reloadDefinitionsIntoDOM(importData.definitions, false, groupList);
    reloadDataIntoDOM(importData.data, false);
    $("#lastChange")[0].innerHTML = (new Date(importData.lastChange)).toString();
}

/**
 * Import timetable data from string in form field importExportData
 */
function importAll() {
    timeTableString = $("#importExportData").val();
    try {
        importData = JSON.parse(timeTableString);
        testVersion(importData);
        // test for old data format (versions below 0.0.5)
        if (importData.definitions == null) {
            // nothing to do: take the default values as defined in js code
        } else {
            if (!reloadDefinitionsIntoDOM(importData.definitions, true)) {
                // if no definition written then ask for keep old data
                clearAllAsk();
            }
        }
        // test for old data format (versions below 0.0.5)
        if (importData.data == null) {
            reloadDataIntoDOM(importData, true);
        } else {
            reloadDataIntoDOM(importData.data, true);
        }
    } catch (ex) {
        alert("Error: " + ex);
    }
    saveData();
}

/**
 * Explizit save of all data and definitions from DOM into local DB.
 */
function saveData() {
    var timeTable = fetchAllFromDOM();
    if (printMode != null || groupList != null) {
        alert('No modification allowed in print mode!');
    } else {
        timeTableString = JSON.stringify(timeTable);
        localStorage.setItem("timeTablePs", timeTableString);
    }
    return timeTable;
}

/**
 * Recursive test for matching a classname in the parent structure.
 * @param {*} elem 
 * @param {*} className 
 * @param {*} level 
 */
function targetDeepTest(elem, className, level) {
    if (elem == null || level < 1) {
        return null;
    }
    if (elem.className != null && elem.className.match('.*' + className + '\\b.*')) {
        return elem;
    }
    return targetDeepTest(elem.parentNode, className, level - 1);
}

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};