/* A builder class to simplify the task of creating HTML elements */
class ElementCreator {
    constructor(tag) {
        this.element = document.createElement(tag);
    }

    id(id) {
        this.element.id = id;
        return this;
    }

    class(clazz) {
        this.element.className = clazz; //Bugfix: class -> className (weil in DOM className)
        return this;
    }

    text(content) {
        this.element.innerHTML = content;
        return this;
    }

    with(name, value) {
        this.element.setAttribute(name, value)
        return this;
    }

    listener(name, listener) {
        this.element.addEventListener(name, listener)
        return this;
    }

    append(child) {
        child.appendTo(this.element);
        return this;
    }

    prependTo(parent) {
        parent.prepend(this.element);
        return this.element;
    }

    appendTo(parent) {
        parent.append(this.element);
        return this.element;
    }

    insertBefore(parent, sibling) {
        parent.insertBefore(this.element, sibling);
        return this.element;
    }

    replace(parent, sibling) {
        parent.replaceChild(this.element, sibling);
        return this.element;
    }
}

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Task 2 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

/* A class representing a resource. This class is used per default when receiving the
   available resources from the server (see end of this file).
   You can (and probably should) rename this class to match with whatever name you
   used for your resource on the server-side.
 */
class Animal { //zu Animal umbenannt (Task2) - client-side model for object from server

    /* If you want to know more about this form of getters, read this:
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get */
    get idforDOM() {
        return `animal-${this.id}`; //animal statt resource (Task2)
    } //generates a unique, predictable DOM ID

}

function add(animal, sibling) { //resource zu animal (Task2)

    const creator = new ElementCreator("article")
        .id(animal.idforDOM); //resource zu animal (Task2)

        //generates article container for animal und sets id from class above

    /* Task 2: Instead of the name property of the example resource, add the properties of
       your resource to the DOM. If you do not have the name property in your resource,
       start by removing the h2 element that currently represents the name. For the 
       properties of your object you can use whatever html element you feel represents
       your data best, e.g., h2, paragraphs, spans, ... 
       Also, you don't have to use the ElementCreator if you don't want to and add the
       elements manually. */

       //Anzeige der Eigenschaften
    creator
        .append(new ElementCreator("h2").text(animal.name)) //resource zu animal
        .append(new ElementCreator("p").text(`Age: ${animal.age}`))
        .append(new ElementCreator("p").text(`Domestic: ${animal.isDomestic ? 'Yes' : 'No'}`));

        //Anzeige Erstellungsdatum
        if (animal.createdAt) {
            const d = new Date (animal.createdAt);
            creator.append(new ElementCreator("p").text(`Created: ${d.toLocaleString()}`))
        } //generates date if there

    creator
        .append(new ElementCreator("button").text("Edit").listener('click', () => {
            edit(animal); //resource zu animal
        })) /*Adds an edit button and registers a click handler that calls 
              edit function with the current animal*/

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Task 3 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

        .append(new ElementCreator("button").text("Remove").listener('click', async () => {
            /* Task 3: Call the delete endpoint asynchronously using either an XMLHttpRequest
               or the Fetch API. Once the call returns successfully, remove the resource from
               the DOM using the call to remove(...) below. */
            
            // Delete Funktion (Task3) - asynchron
            try {
               const res = await fetch (`/api/resources/${animal.id}`, {method: 'DELETE'});
            
            if (!res.ok) throw new Error (`HTTP ${res.status}`);
            remove(animal);  // <- This call removes the resource from the DOM
        
             } catch (err) {
                alert (`Delete failed: ${err.message}`);
        }
    }));

    const parent = document.querySelector('main');

    if (sibling) {
        creator.replace(parent, sibling);
    } else {
        creator.insertBefore(parent, document.querySelector('#bottom'));
    }
        
}

//Delete function -> gets called in function add() when successful - searches object by id and deletes it
function remove(animal) {
    document.getElementById(animal.idforDOM).remove();
}

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Task 4 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

function edit(animal) { //resource to animal
    const formCreator = new ElementCreator("form")
        .id(animal.idforDOM) //resource to animal
        .append(new ElementCreator("h3").text("Edit " + animal.name)); //resource to animal
    
    /* Task 4 - Part 1: Instead of the name property, add the properties your resource has here!
       The label and input element used here are just an example of how you can edit a
       property of a resource, in the case of our example property name this is a label and an
       input field. Also, we assign the input field a unique id attribute to be able to identify
       it easily later when the user saves the edited data (see Task 4 - Part 2 below). 
    */

       //~~~~~~~~~~~~~~~~~~~~~~~~~ Task 4 - Part 1 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
       //replaces existing article with form with the same ID
    formCreator

        //Name (String)
        .append(new ElementCreator("label").text("Name").with("for", "animal-name"))
        .append(new ElementCreator("input").id("animal-name").with("type", "text").with("value", animal.name))

        //Alter (number)
        .append(new ElementCreator("label").text("Age").with("for", "animal-age"))
        .append(new ElementCreator("input").id("animal-age").with("type", "number").with("value", animal.age))

        //Domestic (boolean)
        .append(new ElementCreator("label").text("Domestic").with("for", "animal-domestic"))
        
        const domesticInput = new ElementCreator("input").id("animal-domestic").with("type", "checkbox");

        if (animal.isDomestic) domesticInput.with("checked", "checked");
        formCreator.append(domesticInput);

        //Datum createdAt - read only 
        formCreator.append(new ElementCreator("p").text(
            animal.createdAt ? `Created: ${new Date(animal.createdAt).toLocaleString()}` : ""
        ))

    
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Part 2 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
    //saving the resource on the server and terminating edit mode//
    formCreator
        
        //Speichern
        .append(new ElementCreator("button").text("Speichern").listener('click', async (event) => {
            /* Why do we have to prevent the default action? Try commenting this line. */
            // -> to tell the browser not to use the standard behavior (sending formular and refreshing the page)
            // because in this case JS would abort 
            // and the changes wouldn't be visible anymore
            // by preventing it -> page stays, JS can do handeling (read inputfield, send per fetch() PUT/POST to API, update DOM-view )
            
            event.preventDefault();

            /* The user saves the resource.
               Task 4 - Part 2: We manually set the edited values from the input elements to the resource object. 
               Again, this code here is just an example of how the name of our example resource can be obtained
               and set in to the resource. The idea is that you handle your own properties here.
            */

            //Task 4 - Teil 2:
            const updated = {
                ...animal, //takes over basis incl. id
                //reading properties using the set element ids (part 1) and build an updated object
                name : document.getElementById("animal-name").value,
                age : Number(document.getElementById("animal-age").value),
                isDomestic : document.getElementById("animal-domestic").checked
            };

            /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Part 3 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

            /* Task 4 - Part 3: Call the update endpoint asynchronously. Once the call returns successfully,
               use the code below to remove the form we used for editing and again render 
               the resource in the list.
            */

        try {
            //calls server endpoint PUT for updates - JSON - async
            const resp = await fetch (`/api/resources/${animal.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json"},
                body : JSON.stringify(updated)
            });

            //check if server server answer is OK if not -> exception
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

            //if API returns actualized object, take over
            const serverAnimal = await resp.json().catch(() => null); //if no answer -> catch
            Object.assign(animal, serverAnimal ?? updated);
            //overwrites the old values ​​with the values ​​from the server (serverAnimal) 
            //or, if no response, with updated
            
            add(animal, document.getElementById(animal.idforDOM));  
            // <- Call this after the resource is updated successfully on the server
            //renders the animal and replaces the form element in the DOM

        } catch (err) {
            console.error(err);
            alert("Update failed: " + err.message);
        }
        }))

        .replace(document.querySelector('main'), document.getElementById(animal.idforDOM));
}

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Task 5 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

/* Task 5 - Create a new resource is very similar to updating a resource. First, you add
   an empty form to the DOM with the exact same fields you used to edit a resource.
   Instead of PUTing the resource to the server, you POST it and add the resource that
   the server returns to the DOM (Remember, the resource returned by the server is the
    one that contains an id).
 */
function create() {
    const parent = document.querySelector("main");

    //formular to genereate an object with necessary properties
    const form = new ElementCreator ("form").id("create-form")
        .append(new ElementCreator("h3").text("Create Animal"))

        //name - String
        .append(new ElementCreator("label").text("Name").with("for", "new-animal-name"))
        .append(new ElementCreator("input").id("new-animal-name").with("type", "text").with("value", ""))

        //age - number
        .append(new ElementCreator("label").text("Age").with("for", "new-animal-age"))
        .append(new ElementCreator("input").id("new-animal-age").with("type", "number").with("value", 0))

        .append(new ElementCreator("label").text("Domestic").with("for", "new-animal-domestic"))
        .append(new ElementCreator("input").id("new-animal-domestic").with("type", "checkbox"))

        //Speichern
        .append(new ElementCreator("button").text("Save").listener("click", async (e) => {
            e.preventDefault();

            const NewAnimal = {
                name: document.getElementById("new-animal-name").value,
                age: Number(document.getElementById("new-animal-age").value),
                isDomestic: document.getElementById("new-animal-domestic").checked,
                createdAt: new Date().toISOString()
            };
        
        try {

        const resp = await fetch("/api/resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(NewAnimal)
        });

        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        const created = await resp.json();  
        //
        if (!created.createdAt) created.createdAt = NewAnimal.createdAt;

        document.getElementById("create-form").remove();           
        add(Object.assign(new Animal(), created));    

      } catch (err) {
        console.error(err);
        alert("Create failed: " + err.message);
      }

        }))

        //Abbrechen
        .append(new ElementCreator("button").text("Quit").listener("click", (e) => {
        e.preventDefault();
        document.getElementById("create-form").remove();
        }));

        // Formular oberhalb des #bottom-Platzhalters einfügen
        form.insertBefore(parent, document.querySelector("#bottom"));

}
    

document.addEventListener("DOMContentLoaded", function (event) {

    fetch("/api/resources")
        .then(response => response.json())
        .then(animal => {
            for (const a of animal) {
                add(Object.assign(new Animal(), a));
            }
        });
});

