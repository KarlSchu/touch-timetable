$("#clear").click(function() {
    clearAllAsk();
});

$("#showimport").click(function() {
    $("#timeTableOut").show();
    $("#timeTableUpload").show();
    $("#timeTableImportButton").show();
    $("#timeTableDefinitionImportButton").show();
    $("#timeTableHideButton").show();
    $("#download").hide();
    $("#timeTableOut").focus();
});

$("#timeTableImportButton").click(function() {
    clearAllAsk();
    importData();
    $("#timeTableOut").hide();
    $("#timeTableUpload").hide();
    $("#timeTableImportButton").hide();
    $("#timeTableDefinitionImportButton").hide();
    $("#timeTableHideButton").hide();
});

$("#timeTableDefinitionImportButton").click(function() {
    clearAllAsk();
    importDefinitionData();
    $("#timeTableOut").hide();
    $("#timeTableUpload").hide();
    $("#timeTableImportButton").hide();
    $("#timeTableDefinitionImportButton").hide();
    $("#timeTableHideButton").hide();
});

$("#timeTableHideButton").click(function() {
    $("#timeTableOut").hide();
    $("#download").hide();
    $("#timeTableUpload").hide();
    $("#timeTableHideButton").hide();
    $("#timeTableImportButton").hide();
    $("#timeTableDefinitionImportButton").hide();
});

$("#export").click(function() {
    $("#download").show();
    $("#timeTableOut").show();
    $("#timeTableOut").val(JSON.stringify(fetchDataFromDOM(), null, 4));
    $("#timeTableHideButton").show();
    $("#timeTableImportButton").hide();
    $("#timeTableDefinitionImportButton").hide();
    $("#timeTableUpload").hide();
    $("#timeTableOut").focus();
    $("#timeTableOut")[0].setSelectionRange(0, 0);
    $("#timeTableOut")[0].scrollTop = 0;
    $("#timeTableOut")[0].scrollLeft = 0;
    $("#download")[0].download = "timetable.json"
});

$("#exportdefinition").click(function() {
    $("#download").show();
    $("#timeTableOut").show();
    $("#timeTableOut").val(JSON.stringify(fetchDefinitionFromDOM(), null, 4));
    $("#timeTableHideButton").show();
    $("#timeTableImportButton").hide();
    $("#timeTableDefinitionImportButton").hide();
    $("#timeTableUpload").hide();
    $("#timeTableOut").focus();
    $("#timeTableOut")[0].setSelectionRange(0, 0);
    $("#timeTableOut")[0].scrollTop = 0;
    $("#timeTableOut")[0].scrollLeft = 0;
    $("#download")[0].download = "timetabledef.json"
});

$("#timeTableUpload").change(function(event) {
    var reader = new FileReader();
    // Read file into memory as UTF-16
    reader.readAsText($("#timeTableUpload")[0].files[0], "UTF-8");
    // Handle progress, success, and errors
    reader.onprogress = updateProgress;
    reader.onload = loaded;
    reader.onerror = errorHandler;
});

function loaded(evt) {
    // https://w3c.github.io/FileAPI/#FileReader-interface
    // Obtain the read file data
    var fileString = evt.target.result;
    $("#timeTableOut").val(fileString);
    $("#timeTableOut").focus();
    $("#timeTableOut")[0].setSelectionRange(0, 0);
    $("#timeTableOut")[0].scrollTop = 0;
    $("#timeTableOut")[0].scrollLeft = 0;
}

function updateProgress(evt) {
    if (evt.lengthComputable) {
        // evt.loaded and evt.total are ProgressEvent properties
        var loaded = (evt.loaded / evt.total);
        if (loaded < 1) {
            // Increase the prog bar length
            // style.width = (loaded * 200) + "px";
        }
    }
}

function errorHandler(evt) {
    if (evt.target.error.name == "NotReadableError") {
        alert('ERROR: The file could not be read.');
    }
}

$("#save").click(function() {
    $("#lastChange")[0].innerHTML = (new Date()).toISOString();
    saveData();
});

$("#textprint").click(function() {

    if (printMode != null || groupList != null) {
        print();
    } else {

        var groupString = '';
        $.each(groupDef, function(groupKey, groupValue) {
            if (groupString.length > 0) {
                groupString += ',';
            }
            groupString += groupValue;
        });
        var printList = prompt('Enter groups to print:', groupString);
        if (printList != null) {
            var handle = window.open(window.location.href.replace(/\?.*$/, '') + '?groups=' + printList + '&doprint=true', '_blank', '');
        }
    }
});

$("#download").click(function(event) {
    var timeTable = fetchDataFromDOM();
    this.href = "data:text/json;charset=utf-8," +
        encodeURIComponent($("#timeTableOut").val());
    // encodeURIComponent(JSON.stringify(timeTable, null, 4));
});

$("#ok").on('click', function(event) {
    handleOk(event);
});

var dragged = null;
var draggedForm = null;
var shift = false;
// $(document).on('keydown', function(event) {
//     console.log('keydown');
// });
document.addEventListener("keydown", function(event) {
    var key = event.wich || event.keyCode;
    if (key === 16) {
        shift = true;
    }
});
document.addEventListener("keyup", function(event) {
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
document.addEventListener("drag", function(event) {
    //
}, false);

document.addEventListener("dragstart", function(event) {
    if ((event.target.className != null && event.target.className.match('.*' + 'spring\\b.*')) ||
        (event.target.className != null && event.target.className.match('.*' + 'teacherLesson\\b.*'))) {
        if (printMode != null || groupList != null) {
            alert('No modification allowed in print mode!');
            dragged = null;
            // prevent default to allow drop
            event.preventDefault();
        }
        // store a ref. on the dragged elem
        dragged = event.target;
        // make it half transparent
        dragged.style.opacity = .5;
        event.dataTransfer.setData('text/plain', null)
    } else if (event.target.className != null && event.target.className.match('.*' + 'modalForm\\b.*')) {
        draggedForm = event.target;
        draggedForm.style.opacity = .5;
    } else {
        dragged = null;
        draggedForm = null;
        // prevent default to allow drop
        event.preventDefault();
    }
}, false);

document.addEventListener("dragend", function(event) {
    // reset the transparency
    if (dragged != null) {
        dragged.style.opacity = "";
    }
    if (draggedForm != null) {
        draggedForm.style.opacity = "";
    }
}, false);

/* events fired on the drop targets */
document.addEventListener("dragover", function(event) {
    // prevent default to allow drop
    event.preventDefault();
    var target = targetDeepTest(event.target, "dropLesson", 5);
    if (target != null) {
        if (target != event.target || target.childNodes.length > 0) {
            target.style.background = "red";
        } else {
            target.style.background = "darkgrey";
        }
    }
}, false);

document.addEventListener("dragenter", function(event) {
    // highlight potential drop target when the draggable element enters it
    event.preventDefault();
    var target = targetDeepTest(event.target, "dropLesson", 5);
    if (target != null) {
        if (target != event.target || target.childNodes.length > 0) {
            target.style.background = "red";
        } else {
            target.style.background = "darkgrey";
        }
    }
}, false);

document.addEventListener("dragleave", function(event) {
    // reset background of potential drop target when the draggable element leaves it
    var target = targetDeepTest(event.target, "dropLesson", 5);
    if (target != null) {
        target.style.background = "";
    }
}, false);

document.addEventListener("drop", function(event) {
    //var clone = event.ctrlKey;
    shift = shift || event.shiftKey;

    // move dragged elem to the selected drop target
    if (dragged != null) {
        // prevent default action (open as link for some elements)
        event.preventDefault();
        var target = targetDeepTest(event.target, "dropLesson", 5);
        if (target != null) {
            target.style.background = "";
            if (shift && dragged.parentNode.className != null &&
                dragged.parentNode.className.match('.*' + 'dropLesson\\b.*')) {
                dragged.parentNode.removeChild(dragged);
            }
            while (target.childNodes.length > 0) {
                target.removeChild(target.childNodes[0]);
            }
            var dupNode = dragged.cloneNode(true);
            dupNode.style.opacity = "";
            dupNode.style.cursor = "move";
            dupNode.className = dragged.className;
            target.appendChild(dupNode);

            dupNode.addEventListener("click", function(event) {
                clickOnLesson(event);
                window.location.href = "#openModal";
                $("#subject").focus();
            }, false);
            $("#lastChange")[0].innerHTML = (new Date()).toISOString();
        } else if (dragged.className.match('.*' + 'spring\\b.*')) {
            //do nothing: it comes from 
        } else {
            dragged.parentNode.removeChild(dragged);
        }
        saveData();
        recalcAll();
    } else if (draggedForm != null) {
        draggedForm.styl.left = event.clientX;
        draggedForm.styl.top = event.clientY;
        event.preventDefault();
    }
}, false);