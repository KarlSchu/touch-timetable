function clickOnLesson(event) {
    var target = event.currentTarget;
    var lessonId = target.parentNode.id;
    $("#fieldId").text(lessonId);
    $("#lessonNr").text("'" + lessonId.replace(new RegExp(/([A-Z])L([0-9]+)/gmi), " Gr \$1 \$2'"));
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
    saveData();
}

// function extendContent(origContent) {
//     var newContent = prompt("Add content", origContent);
//     if (newContent != null) {
//         return newContent;
//     }
//     return origContent;
// }

function initTimeTable() {
    var timeTable = new Object();
    ['mo', 'di', 'mi', 'do', 'fr'].forEach(function (weekDay) {
        timeTable[weekDay] = new Object();
        ['A', 'B', 'C', 'D'].forEach(function (groupNr) {
            timeTable[weekDay][groupNr] = new Object();
            ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8'].forEach(function (lessonNr) {
                timeTable[weekDay][groupNr][lessonNr] = '';
            });
        });
    });
    return timeTable;
}

function fetchDataFromDOM() {
    var timeTable = initTimeTable();
    ['mo', 'di', 'mi', 'do', 'fr'].forEach(function (weekDay) {
        ['A', 'B', 'C', 'D'].forEach(function (groupNr) {
            ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8'].forEach(function (lessonNr) {
                timeTable[weekDay][groupNr][lessonNr] = '';
                var e1List = $("#" + weekDay + groupNr + lessonNr)
                if (e1List.length > 0) {
                    var e2List = e1List[0].childNodes;
                    if (e2List.length > 0) {
                        var content = new Object();
                        content.id = e2List[0].id
                        content.teacher = e2List[0].children[0].innerHTML
                        content.subject = e2List[0].children[1].innerHTML
                        content.room = e2List[0].children[2].innerHTML
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
    ['mo', 'di', 'mi', 'do', 'fr'].forEach(function (weekDay) {
        ['A', 'B', 'C', 'D'].forEach(function (groupNr) {
            ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8'].forEach(function (lessonNr) {
                var target = $("#" + weekDay + groupNr + lessonNr)[0];
                if (target == undefined) {
                    alert("Error: Expected timetable element '" + weekDay + groupNr + lessonNr + "' not found!");
                } else if (target.className == "dropLesson") {
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
    ['A', 'B', 'C', 'D'].forEach(function (groupNr) {
        $("#Gr" + groupNr).text('_');
        ['T0', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11'].forEach(function (taecherNr) {
            $("#" + taecherNr + "G" + groupNr).text('-');
            $("#" + taecherNr + "G" + groupNr).text('-');
            $("#" + taecherNr + "G" + groupNr).text('-');
            $("#" + taecherNr + "G" + groupNr).text('-');
        });
    });
    var groupCounter = new Object();
    groupCounter.A = 0;
    groupCounter.B = 0;
    groupCounter.C = 0;
    groupCounter.D = 0;
    // calc lessons per teacher
    elements.each(function (idxDropLesson, dropLesson) {
        if (dropLesson.childNodes.length > 0) {
            var regExGroups = /..([ABCD])L[0-9]/.exec(dropLesson.id);
            if (regExGroups.length > 0) {
                var regExGroup = regExGroups[1];
                dropLesson.childNodes.forEach(function (child) {
                    ['T0', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11'].forEach(function (taecherNr) {
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
}

function loadDataFromStore() {
    $("#timeTableOut").val('');
    timeTableString = localStorage.getItem("timeTablePs");
    timeTable = JSON.parse(timeTableString);
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
