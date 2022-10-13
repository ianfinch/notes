// Split each list item into DIVs containing name and role
[...document.getElementsByTagName("li")].forEach(elem => {

    let person, role;
    [...elem.childNodes].forEach(listContent => {

        if (listContent.nodeName === "#text") {

            [person, role] = listContent.textContent.split(/ *= */);
            listContent.textContent = "";
        }
    });

    const detailsDiv = document.createElement("div");
    detailsDiv.classList.add("person");

    const personDiv = document.createElement("div");
    personDiv.classList.add("name");
    personDiv.textContent = person;
    detailsDiv.appendChild(personDiv);

    const roleDiv = document.createElement("div");
    roleDiv.classList.add("role");
    roleDiv.textContent = role;
    detailsDiv.appendChild(roleDiv);

    elem.prepend(detailsDiv);
});

/**
 * Wrap a list with an "org" class
 */
const wrapList = (elem, parentNode) => {

    const wrapperDiv = document.createElement("div");
    wrapperDiv.classList.add("org");
    parentNode.insertBefore(wrapperDiv, elem);
    wrapperDiv.appendChild(elem);
};

// Wrap the top-level lists in a DIV
[...document.getElementById("content").childNodes].forEach(elem => {

    if (elem.nodeName === "UL") {
        wrapList(elem, document.getElementById("content"));
    }
});

// Lists may also be in a section
[...document.getElementsByTagName("section")].forEach(section => {

    [...section.childNodes].forEach(elem => {

        if (elem.nodeName === "UL") {
            wrapList(elem, section);
        }
    });
});
