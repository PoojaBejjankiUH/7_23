document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    // Check if the courses are already stored in local storage
    let courses = JSON.parse(localStorage.getItem('courseList')) || [];

    if (courses.length === 0) {
        // If not, fetch the courses from the JSON file
        fetch('combinedAllCourses.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Store the fetched data in local storage
                courses = Object.values(data);
                localStorage.setItem('courseList', JSON.stringify(courses));
                initTwoWayBinding();
            })
            .catch(error => console.error('Error fetching courses:', error));
    } else {
        // If courses are already in local storage, initialize two-way binding
        initTwoWayBinding();
    }

    function initTwoWayBinding() {
        document.querySelectorAll("[data-yh-repeat]").forEach(function(el) {
            var dataObject = window[el.closest("[data-yh-object]").getAttribute("data-yh-object")];
            for (var cntRow = 0; cntRow < courses.length; cntRow++) {
                if (cntRow == 0) {
                    renderEach(el, courses[cntRow]);
                } else {
                    var clone = el.cloneNode(true);
                    el.parentElement.appendChild(clone);
                    renderEach(clone, courses[cntRow]);
                }
            }
        });
    }

    function renderEach(domNode, dataObject) {
        domNode.querySelectorAll("[data-yh-field]").forEach(function(el) {
            var dataAttribute = el.getAttribute("data-yh-field");
            el.value = dataObject[dataAttribute];
            el.addEventListener("change", function() {
                dataObject[dataAttribute] = el.value;
                localStorage.setItem('courseList', JSON.stringify(courses));
            }, false);
        });

        domNode.querySelector('[data-yh-delete]').addEventListener('click', function() {
            const index = courses.indexOf(dataObject);
            deleteCourse(index);
        });

        domNode.querySelector('[data-yh-edit]').addEventListener('click', function() {
            const index = courses.indexOf(dataObject);
            editCourse(index);
        });
    }

    function deleteCourse(index) {
        courses.splice(index, 1);
        localStorage.setItem('courseList', JSON.stringify(courses));
        location.reload();
    }

    function editCourse(index) {
        const course = courses[index];
        document.getElementById('cc').value = course.courseCode;
        document.getElementById('cn').value = course.courseName;
        document.getElementById('ccre').value = course.credits;
        document.getElementById('des').value = course.description;

        document.getElementById('submit').style.display = 'none';
        document.getElementById('update').style.display = 'block';

        document.getElementById('update').onclick = () => updateCourse(index);
    }

    function updateCourse(index) {
        if (validateForm()) {
            const course = courses[index];
            course.courseCode = document.getElementById('cc').value;
            course.courseName = document.getElementById('cn').value;
            course.credits = document.getElementById('ccre').value;
            course.description = document.getElementById('des').value;

            localStorage.setItem('courseList', JSON.stringify(courses));
            location.reload();
        }
    }

    document.getElementById('submit').onclick = () => {
        if (validateForm()) {
            const newCourse = {
                courseCode: document.getElementById('cc').value,
                courseName: document.getElementById('cn').value,
                credits: document.getElementById('ccre').value,
                description: document.getElementById('des').value
            };

            courses.push(newCourse);
            localStorage.setItem('courseList', JSON.stringify(courses));
            location.reload();
        }
    };

    function validateForm() {
        const ccode = document.getElementById("cc").value;
        const cname = document.getElementById("cn").value;
        const ccre = document.getElementById("ccre").value;
        const des = document.getElementById("des").value;

        if (ccode === "") {
            alert("Please enter Course Code");
            return false;
        }
        if (cname === "") {
            alert("Please enter Course Name");
            return false;
        }
        if (ccre === "") {
            alert("Please enter Course Credits");
            return false;
        } else if (ccre < 1 || ccre > 4) {
            alert("Course credits must be between 1 and 4");
            return false;
        }
        if (des === "") {
            alert("Please enter Description");
            return false;
        }
        return true;
    }

    // Initial call to display data if already present in local storage
    initTwoWayBinding();
});


document.onload = showData();
