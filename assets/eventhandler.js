$("#Clear").click(function () {
    clearAll();
});
$("#ShowImport").click(function () {
    $("#timeTableOut").show();
    $("#timeTableImportButton").show();
    $("#timeTableHideButton").show();
    $("#timeTableOut").focus();
});
$("#timeTableImportButton").click(function () {
    importData();
    $("#timeTableOut").hide();
    $("#timeTableImportButton").hide();
    $("#timeTableHideButton").hide();
});
$("#timeTableHideButton").click(function () {
    $("#timeTableOut").hide();
    $("#timeTableHideButton").hide();
    $("#timeTableImportButton").hide();
});
$("#Export").click(function () {
    $("#timeTableOut").show();
    $("#timeTableOut").val(JSON.stringify(fetchDataFromDOM(), null, 4));
    $("#timeTableHideButton").show();
    $("#timeTableImportButton").hide();
    $("#timeTableOut").focus();
    $("#timeTableOut")[0].setSelectionRange(0, 0);
    $("#timeTableOut")[0].scrollTop = 0;
    $("#timeTableOut")[0].scrollLeft = 0;
});


$("#Save").click(function () {
    saveData();
});
$("#TextPrint").click(function () {
    print();
});
$("#ok").click(function (event) {
    handleOk(event);
});

var dragged = null;;
var shift = false;
document.addEventListener("keydown", function (event) {
    var key = event.wich || event.keyCode;
    if (key === 16) {
        shift = true;
    }
});
document.addEventListener("keyup", function (event) {
    var key = event.wich || event.keyCode;
    if (key === 16) {
        shift = false;
    }
    if ($("#teacher").is(':visible') && key === 13) {
        handleOk(event);
        window.location.href = '';
    }
});

/* events fired on the draggable target */
document.addEventListener("drag", function (event) {
    //
}, false);

document.addEventListener("dragstart", function (event) {
    if (event.target.className == "spring" || event.target.className == "teacherLesson") {
        // store a ref. on the dragged elem
        dragged = event.target;
        // make it half transparent
        dragged.style.opacity = .5;
        event.dataTransfer.setData('text/plain', null)
    } else {
        dragged = null;
        // prevent default to allow drop
        event.preventDefault();
    }
}, false);

document.addEventListener("dragend", function (event) {
    // reset the transparency
    dragged.style.opacity = "";
}, false);

/* events fired on the drop targets */
document.addEventListener("dragover", function (event) {
    // prevent default to allow drop
    event.preventDefault();
    var target = targetDeepTest(event.target, "dropLesson", 5);
    if (target != null) {
        if (target != event.target || target.childNodes.length > 0) {
            target.style.background = "red";
        }
        else {
            target.style.background = "darkgrey";
        }
    }
}, false);

document.addEventListener("dragenter", function (event) {
    // highlight potential drop target when the draggable element enters it
    event.preventDefault();
    var target = targetDeepTest(event.target, "dropLesson", 5);
    if (target != null) {
        if (target != event.target || target.childNodes.length > 0) {
            target.style.background = "red";
        }
        else {
            target.style.background = "darkgrey";
        }
    }
}, false);

document.addEventListener("dragleave", function (event) {
    // reset background of potential drop target when the draggable element leaves it
    var target = targetDeepTest(event.target, "dropLesson", 5);
    if (target != null) {
        target.style.background = "";
    }
}, false);

document.addEventListener("drop", function (event) {
    //var clone = event.ctrlKey;
    shift = shift || event.shiftKey;

    // prevent default action (open as link for some elements)
    event.preventDefault();
    // move dragged elem to the selected drop target
    if (dragged != null) {
        var target = targetDeepTest(event.target, "dropLesson", 5);
        if (target != null) {
            target.style.background = "";
            if (shift && dragged.parentNode.className == "dropLesson") {
                dragged.parentNode.removeChild(dragged);
            }
            while (target.childNodes.length > 0) {
                target.removeChild(target.childNodes[0]);
            }
            var dupNode = dragged.cloneNode(true);
            dupNode.style.opacity = "";
            dupNode.style.cursor = "move";
            dupNode.className = "teacherLesson";
            target.appendChild(dupNode);

            dupNode.addEventListener("click", function (event) {
                clickOnLesson(event);
                window.location.href = "#openModal";
                $("#subject").focus();
            }, false);
        } else if (dragged.className == "spring") {
            ;
        } else {
            dragged.parentNode.removeChild(dragged);
        }
        saveData();
        recalcAll();
    }
}, false);
