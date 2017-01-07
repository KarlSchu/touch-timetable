
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
                        timeTable[weekDay][groupNr][lessonNr] = e2List[0].id;
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
                    var teacherId = timeTable[weekDay][groupNr][lessonNr];
                    var teacherElem = $("#" + teacherId)[0];
                    if (teacherId != '') {
                        while (target.childNodes.length > 0) {
                            target.removeChild(target.childNodes[0]);
                        }
                        var dupNode = teacherElem.cloneNode(true);
                        dupNode.style.opacity = "";
                        dupNode.style.cursor = "move";
                        dupNode.className = "teacherLesson";
                        target.appendChild(dupNode);
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
        ['T0', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9'].forEach(function (taecherNr) {
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
                    ['T0', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9'].forEach(function (taecherNr) {
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
