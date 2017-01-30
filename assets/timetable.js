var lessonDef = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8'];
var lessonTimeDef = ['8:00-9:50', '10:10-12:00'];
var dayDef = ['mo', 'di', 'mi', 'do', 'fr'];

// var groupDef = ['A', 'B', 'C', 'D', 'E'];
// var groupNameDef = ['GrA1', 'GrA2', 'GrA3', 'GrB', 'GrC', 'GrD'];
var groupDef = { 'A': 'GrA1', 'B': 'GrA', 'C': 'GrA3', 'D': 'GrB', 'E': 'GrC' };

// var teacherDef = ['T0', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11'];
// var teacherNameDef = ['KsC', 'KSC', 'UWO', 'SBO', 'CES', 'XXX', 'KRU', 'HME', 'SKU', 'AST', 'ISC', 'YYY'];
var teacherDef = {
    'T0': 'KsC', 'T1': 'KSC', 'T2': 'UWO', 'T3': 'SBO', 'T4': 'CES', 'T5': 'XXX'
    , 'T6': 'KRU', 'T7': 'HME', 'T8': 'SKU', 'T9': 'AST', 'T10': 'ISC', 'T11': 'YYY'
}

function initTimeTableGrid() {
    var nodeTr = document.createElement("tr");
     $.each(groupDef, function (key, value) {
        var nodeTd = document.createElement("td");
        nodeTd.appendChild(document.createTextNode(value));
        // node.setAttribute('id', key);
        nodeTd.setAttribute('class', 'headerGroup');
        $("#headerGroup"+ky).append(nodeTd);
    });
}

function clickOnLesson(event) {
    var target = event.currentTarget;
    var lessonId = target.parentNode.id;
    $("#fieldId").text(lessonId);
    $("#lessonNr").text(lessonId.replace(new RegExp(/([A-Z])L([0-9]+)/gmi), " \$2, Gr \$1"));
    $("#lessonNr").text($("#lessonNr").text().replace("mo", "Montag").replace("di", "Dienstag"));
    $("#teacher").text(target.children[0].innerHTML);
    $("#subject").val(target.children[1].innerHTML);
    $("#room").val(target.children[2].innerHTML);
}

function handleOk(event) {
    var fieldId = $("#fieldId").text();
    var field = $("#" + fieldId)[0];
    field.children[0].children[1].innerHTML = $("#subject").val();
    field.children[0].children[2].innerHTML = $("#room").val();
    saveData(); idxDropLesson
}

function initTimeTable() {
    var timeTable = new Object();
    dayDef.forEach(function (weekDay) {
        timeTable[weekDay] = new Object();
        groupDef.forEach(function (groupNr) {
            timeTable[weekDay][groupNr] = new Object();
            lessonDef.forEach(function (lessonNr) {
                timeTable[weekDay][groupNr][lessonNr] = '';
            });
        });
    });
    return timeTable;
}

function fetchDataFromDOM() {
    var timeTable = initTimeTable();
    dayDef.forEach(function (weekDay) {
        groupDef.forEach(function (groupNr) {
            lessonDef.forEach(function (lessonNr) {
                timeTable[weekDay][groupNr][lessonNr] = '';
                var level1List = $("#" + weekDay + groupNr + lessonNr)
                if (level1List.length > 0) {
                    var level2List = level1List[0].childNodes;
                    if (level2List.length > 0) {
                        var content = new Object();
                        content.id = level2List[0].id
                        content.teacher = level2List[0].children[0].innerHTML
                        content.subject = level2List[0].children[1].innerHTML
                        content.room = level2List[0].children[2].innerHTML
                        timeTable[weekDay][groupNr][lessonNr] = content;
                        //timeTable[weekDay][groupNr][lessonNr] = e2List[0].id;
                    }
                }
            });
        });
    });
    return timeTable
}

function reloadDataIntoDOM(timeTable) {
    dayDef.forEach(function (weekDay) {
        groupDef.forEach(function (groupNr) {
            lessonDef.forEach(function (lessonNr) {
                var target = $("#" + weekDay + groupNr + lessonNr)[0];
                if (target == undefined) {
                    alert("Error: Expected timetable element '" + weekDay + groupNr + lessonNr + "' not found!");
                } else if (target.className == "dropLesson") {
                    if (timeTable == null) {
                        timeTable = initTimeTable();
                    }
                    if (timeTable[weekDay][groupNr][lessonNr] != "") {
                        var teacherId = timeTable[weekDay][groupNr][lessonNr].id;
                        var teacherElem = $("#" + teacherId)[0];
                        if (teacherId != '') {
                            var teacherName = timeTable[weekDay][groupNr][lessonNr].teacher;
                            var subject = timeTable[weekDay][groupNr][lessonNr].subject;
                            var room = timeTable[weekDay][groupNr][lessonNr].room;
                            while (target.childNodes.length > 0) {
                                target.removeChild(target.childNodes[0]);
                            }
                            var dupNode = teacherElem.cloneNode(true);
                            dupNode.style.opacity = "";
                            dupNode.style.cursor = "move";
                            dupNode.className = "teacherLesson";
                            //dupNode.innerHTML = timeTable[weekDay][groupNr][lessonNr].val;
                            dupNode.children[0].innerHTML = timeTable[weekDay][groupNr][lessonNr].teacher;
                            dupNode.children[1].innerHTML = timeTable[weekDay][groupNr][lessonNr].subject;
                            dupNode.children[2].innerHTML = timeTable[weekDay][groupNr][lessonNr].room;
                            dupNode.addEventListener("click", function (event) {
                                clickOnLesson(event);
                                window.location.href = "#openModal";
                                $("#subject").focus();
                                //event.target.innerHTML = extendContent(event.target.innerHTML);
                            }, false);
                            target.appendChild(dupNode);
                        }
                    }
                }
            });
        });
    });
    recalcAll();
}

function clearAll() {
    if (confirm("Clear all lesson entry from time table?")) {
        var elements = $(".dropLesson");
        elements.each(function (idx, elem) {
            while (elem.childNodes.length > 0) {
                elem.removeChild(elem.childNodes[0]);
            }
        });
        recalcAll();
    }
}

function recalcAll() {
    var count = 0;
    var teachers = $(".spring");
    var elements = $(".dropLesson");
    // init output fields
    groupDef.forEach(function (groupNr) {
        $("#Gr" + groupNr).text('-');
        teacherDef.forEach(function (taecherNr) {
            $("#" + taecherNr + "G" + groupNr).text('-');
        });
    });
    // claculate output fields
    var groupCounter = new Object();
    groupCounter.A = 0;
    groupCounter.B = 0;
    groupCounter.C = 0;
    groupCounter.D = 0;
    groupCounter.E = 0;
    // calc lessons per teacher
    elements.each(function (idxDropLesson, dropLesson) {
        if (dropLesson.childNodes.length > 0) {
            var regExGroups = /..([ABCDE])L[0-9]/.exec(dropLesson.id);
            if (regExGroups.length > 0) {
                var regExGroup = regExGroups[1];
                dropLesson.childNodes.forEach(function (child) {
                    teacherDef.forEach(function (taecherNr) {
                        if (child.id == taecherNr) {
                            var lessons;
                            if (isNaN($("#" + taecherNr + "G" + regExGroup).text())) {
                                lessons = 0;
                            } else {
                                lessons = parseInt($("#" + taecherNr + "G" + regExGroup).text());
                            }
                            $("#" + taecherNr + "G" + regExGroup).text(lessons + 1);
                        }
                    });
                    groupCounter[regExGroup]++;
                });
                count++;
            }
        }
    });

    $("#lessonsCount").text(count);
    $("#GrA").text(groupCounter.A);
    $("#GrB").text(groupCounter.B);
    $("#GrC").text(groupCounter.C);
    $("#GrD").text(groupCounter.D);
    $("#GrE").text(groupCounter.E);
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
}

function saveData() {
    var timeTable = fetchDataFromDOM();
    timeTableString = JSON.stringify(timeTable);
    localStorage.setItem("timeTablePs", timeTableString);
}

function targetDeepTest(elem, className, level) {
    if (elem == null || level < 1) {
        return null;
    }
    if (elem.className == className) {
        return elem;
    }
    return targetDeepTest(elem.parentNode, className, level - 1);
}
