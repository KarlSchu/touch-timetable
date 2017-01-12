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
    $("#timeTableOut").val(JSON.stringify(fetchDataFromDOM()));
    $("#timeTableHideButton").show();
    $("#timeTableImportButton").hide();
    $("#timeTableOut").focus();
});
$("#Save").click(function () {
    saveData();
});
$("#textPrint").click(function () {
    print();
});
$("#ok").click(function (event) {
    handleOk(event);
});

var dragged;

document.addEventListener("keyup", function (event) {
    var key = event.wich || event.keyCode;
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
        event.target.style.opacity = .5;
    } else {
        dragged = null;
        // prevent default to allow drop
        event.preventDefault();
    }
}, false);

document.addEventListener("dragend", function (event) {
    // reset the transparency
    event.target.style.opacity = "";
}, false);

/* events fired on the drop targets */
document.addEventListener("dragover", function (event) {
    // prevent default to allow drop
    event.preventDefault();
    if (event.target.className == "dropLesson") {
        event.target.style.background = "darkgray";
    }
}, false);

document.addEventListener("dragenter", function (event) {
    // highlight potential drop target when the draggable element enters it
    if (event.target.className == "dropLesson") {
        event.target.style.background = "";
    }

}, false);

document.addEventListener("dragleave", function (event) {
    // reset background of potential drop target when the draggable element leaves it
    if (event.target.className == "dropLesson") {
        event.target.style.background = "";
    }

}, false);

document.addEventListener("drop", function (event) {
    //var key = event.wich || event.keyCode;
    //var clone = event.ctrlKey;
    var shift = event.shiftKey;
    // prevent default action (open as link for some elements)
    event.preventDefault();
    // move dragged elem to the selected drop target
    if (dragged != null) {
        if (event.target.className == "dropLesson") {
            if (event.target.className == "dropLesson") {
                event.target.style.background = "";
            }
            if (shift && dragged.parentNode.className == "dropLesson") {
                //event.target.style.background = "green";
                dragged.parentNode.removeChild(dragged);
            }
            while (event.target.childNodes.length > 0) {
                event.target.removeChild(event.target.childNodes[0]);
            }
            var dupNode = dragged.cloneNode(true);
            dupNode.style.opacity = "";
            dupNode.style.cursor = "move";
            dupNode.className = "teacherLesson";
            event.target.appendChild(dupNode);

            dupNode.addEventListener("click", function (event) {
                clickOnLesson(event);
                window.location.href = "#openModal";
                $("#subject").focus();
            }, false);
        } else if (dragged.className == "spring") {
            ;
        } else {
            dragged.parentNode.removeChild(dragged);
            //dragged.parentNode.style.background = "";
        }
        saveData();
        recalcAll();
    }
    if (event.target.className == "dropLesson") {
        event.target.style.background = "";
    }
}, false);