// timetable.js
//
var countBreaksAsTeacherLessons = true;
var countBreaksAsGroupLessons = true;
var breakLessonNr = 6;
var coloredLessons = true;
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
var dayDef = { //max mo - so
    'mo': 'Montag',
    'di': 'Dienstag',
    'mi': 'Mittwoch',
    'do': 'Donnerstag',
    'fr': 'Freitag' //,
        //'sa': 'Samstag'
};
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

var timeStamp = "";

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

function initTimeTableGrid() {
    initTeachersTable();
    initGroupsTable();
    initTimetableTable();
}

// teacher source
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

// lesson and group sums
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

// timeline and days 
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

function initTimeTable() {
    var timeTable = new Object();
    timeTable.version = '';
    timeTable.lastChange = '';
    timeTable.remarks = '';
    $.each(dayDef, function(dayKey, dayValue) {
        timeTable[dayKey] = new Object();
        $.each(groupDef, function(groupKey, groupValue) {
            timeTable[dayKey][groupKey] = new Object();
            $.each(lessonDef, function(lessonKey, lessonValue) {
                timeTable[dayKey][groupKey][lessonKey] = '';
            });
        });
    });
    return timeTable;
}

function fetchDefinitionFromDOM() {
    var definition = new Object();
    definition.dayDef = dayDef;
    definition.groupDef = groupDef;
    definition.lessonDef = lessonDef;
    definition.teacherDef = teacherDef;
    return definition;
}

function fetchDataFromDOM() {
    var timeTable = initTimeTable();
    timeTable.remarks = $("#remarks").val();
    timeTable.legend = $("#legend").val();
    timeTable.version = $("#version")[0].innerHTML;
    timeTable.lastChange = $("#lastChange")[0].innerHTML;
    $.each(dayDef, function(dayKey, dayValue) {
        $.each(groupDef, function(groupKey, groupValue) {
            $.each(lessonDef, function(lessonKey, lessonValue) {
                timeTable[dayKey][groupKey][lessonKey] = '';
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
                        timeTable[dayKey][groupKey][lessonKey] = content;
                    }
                }
            });
        });
    });
    //$("#lastChange")[0].innerHTML = (new Date()).toISOString();
    return timeTable;
}

function reloadDefinitionDataIntoDOM(timeTableDefinition) {

    if (timeTableDefinition.teacherDef != null) {
        if (confirm("Teachers definition found. Overwrite current definition and data?")) {
            teacherDef = timeTableDefinition.teacherDef;
        }
    }
    if (timeTableDefinition.groupDef != null) {
        if (confirm("Group definition found. Overwrite current definition and data?")) {
            groupDef = new Object();
            $.each(timeTableDefinition.groupDef, function(groupKey, groupValue) {
                groupDef[groupKey] = groupValue;
            });
        }
    }
    if (timeTableDefinition.dayDef != null) {
        if (confirm("Day definition found. Overwrite current definition and data?")) {
            dayDef = timeTableDefinition.dayDef;
        }
    }
    if (timeTableDefinition.lessonsDef != null) {
        if (confirm("Lesson periods definition found. Overwrite current definition and data?")) {
            lessonDef = timeTableDefinition.lessonDef;
        }
    }
    initTimeTableGrid();
}

function reloadDataIntoDOM(timeTable) {
    $("#remarks").val(timeTable.remarks);
    timeTable.remarks = $("#remarks").val();
    $("#lastChange")[0].innerHTML = timeTable.lastChange;
    $("#legend").val(timeTable.legend);
    if (timeTable.version != $("#version")[0].innerHTML) {
        alert('Version upgrade from ' + timeTable.version + ' to ' + $("#version")[0].innerHTML);
        timeTable.version = $("#version")[0].innerHTML;
    }
    $.each(dayDef, function(dayKey, dayValue) {
        $.each(groupDef, function(groupKey, groupValue) {
            $.each(lessonDef, function(lessonKey, lessonValue) {
                var target = $("#" + dayKey + groupKey + lessonKey)[0];
                if (target == undefined) {
                    alert("Error: Expected timetable element '" + dayKey + groupKey + lessonKey + "' not found!");
                } else if (target.className != null && target.className.match('.*' + 'dropLesson\\b.*')) {
                    if (timeTable == null) {
                        timeTable = initTimeTable();
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

function clearAllAsk() {
    if (confirm("Clear all lesson entry from time table?")) {
        clearAllDo();
    }
}

function clearAllDo() {
    var elements = $(".dropLesson");
    elements.each(function(idx, elem) {
        while (elem.childNodes.length > 0) {
            elem.removeChild(elem.childNodes[0]);
        }
    });
    $("#lastChange")[0].innerHTML = (new Date()).toISOString();
    recalcAll();
}

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

function loadDataFromStore() {
    $("#timeTableOut").val('');
    timeTableString = localStorage.getItem("timeTablePs");
    timeTable = JSON.parse(timeTableString);
    if (timeTable == null) {
        timeTable = initTimeTable();
    }
    document.getElementById("timeTableOut").innerHTML = JSON.stringify(timeTable);
    reloadDataIntoDOM(timeTable);
}

function importData() {
    timeTableString = $("#timeTableOut").val();
    try {
        timeTable = JSON.parse(timeTableString);
        reloadDataIntoDOM(timeTable);
    } catch (ex) {
        alert("Error: " + ex);
    }
    saveData();
}

function importDefinitionData() {
    timeTableDefinitionString = $("#timeTableOut").val();
    try {
        timeTableDefinition = JSON.parse(timeTableDefinitionString);
        reloadDefinitionDataIntoDOM(timeTableDefinition);
    } catch (ex) {
        alert("Error: " + ex);
    }
    saveData();
}

function saveData() {
    var timeTable = fetchDataFromDOM();
    if (printMode != null || groupList != null) {
        alert('No modification allowed in print mode!');
    } else {
        timeTableString = JSON.stringify(timeTable);
        localStorage.setItem("timeTablePs", timeTableString);
        // $("#lastChange")[0].innerHTML = (new Date()).toISOString();
    }
    return timeTable;
}

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