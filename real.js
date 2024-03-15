// json server has to be in a different folder

  const eventAPIs = (function () {
    const API_URL = "http://localhost:3000/events";
  
    async function getEvents() {
      return fetch(API_URL).then((res) => res.json());
    }
  
    //{title: "string"}
    async function addEvent(newEvent) {
      return fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEvent),
      }).then((res) => res.json());
    }
  
    async function deleteEvent(id) {
      return fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      }).then((res) => res.json());
    }
    async function getEventById(id) {
        return fetch(`${API_URL}/${id}`, {
          method: "GET",
        }).then((res) => res.json());
      }
    async function updateEvent(event) {
        return fetch(`${API_URL}/${event.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }).then((res) => res.json());
      }
    
    return {
      getEvents,
      addEvent,
      deleteEvent,
      updateEvent,
      getEventById
    };
  })();
  class EventsView {
    constructor() {
      this.eventList = document.querySelector(".event-list");
      this.addNewEvent = document.querySelector(".event-new-button");
      this.newEventForm = document.querySelector(".event-new-form");
    }
  
    clearInput(id) {
      document.getElementById(id).parentElement.remove();
    }
  
    renderEvents(events) {
      this.eventList.innerHTML = "";
      events.forEach((event) => {
        this.renderNewEvent(event);
      });
    }
  
    removeEventElem(id) {
      document.getElementById(id).parentElement.remove();
    }
  
    renderNewEvent(newEvents) {
      this.eventList.appendChild(this.createEventElement(newEvents));
    }

    renderNewForm(){
        this.eventList.appendChild(this.createNewEventElement())
    }
    renderEditEvent(event){
        const eventElement =  document.getElementById(event.id);
        eventElement.innerHTML = `
        <div id="name_${event.id}" class="event__name">${event.eventName}</div>
        <p class="event__start" id="start_${event.id}" >${event.startDate}</p>
        <p  class="event__end" id="end_${event.id}" >${event.endDate}</p>
        <div class="event__actions">
            <button class="event__del-btn">Delete</button>
            <button class="event__edit-btn">Edit</button>
        </div>
        `;
    }

    createEventElement(event) {
      const eventElement = document.createElement("div");
      eventElement.classList.add("event");
      
      eventElement.innerHTML = `
      <div class="event_item" id="${event.id}">
      <div id="name_${event.id}" class="event__name">${event.eventName}</div>
      <p class="event__start" id="start_${event.id}" >${event.startDate}</p>
      <p  class="event__end" id="end_${event.id}" >${event.endDate}</p>
      <div class="event__actions">
          <button class="event__del-btn">Delete</button>
          <button class="event__edit-btn">Edit</button>
      </div>
      <div>`;

        return eventElement;
    }

    createNewEventElement() {
        const eventElement = document.createElement("div");
        eventElement.classList.add("event");
        const randomNum = Math.floor(Math.random() * 500) + 1;
        eventElement.setAttribute("id",randomNum);
        eventElement.innerHTML = `
        <div class="event_item" id="new_${randomNum}">
        <input class="name_new"></input>
        <input type="date" class="event__start" id="start_new" >
        <input type="date" class="event__end" id="end_new" >
        <div class="event__actions">
            <button class="event__save-btn">Save</button>
            <button class="event__cancel-btn">Cancel</button>
        </div>
        <div>
        `;
          return eventElement;
      }

  }
  
  class EventsModel {
    #events;
    constructor(events = []) {
      this.#events = events;
    }
  
    getEvents() {
      return this.#events;
    }
  
    setEvents(newEvents) {
      this.#events = newEvents;
    }
  
    addEvent(newEvents) {
      this.#events.push(newEvents);
    }
  
    deleteEvent(id) {
      this.#events = this.#events.filter((event) => event.id !== id);
    }
    updateEvent(newEvent){
        this.#events = this.#events.map((event) => {
            if(event.id === newEvent.id){
                return newEvent;
            }
            return event;
        });
    }
  }
  
  class EventsController {
    constructor(view, model) {
      this.view = view;
      this.model = model;
      this.init();
    }
  
    init() {
      this.setUpEvents();
      this.fetchEvents();
    }
  
    setUpEvents() {
      this.setUpDeleteEvent();
      this.setUpNewEvent();
      this.setUpSubmitNewEvent();
      this.setUpCancelEvent();
      this.setUpEditSaveEvent();
      this.setUpEditEvent();
      this.setUpEditCancelEvent();
    }
  
    async fetchEvents() {
      const events = await eventAPIs.getEvents();
      this.model.setEvents(events);
      this.view.renderEvents(events);
    }
  
    setUpDeleteEvent() {
      //event delegation
      this.view.eventList.addEventListener("click", async (e) => {
        const elem = e.target;
        if (elem.classList.contains("event__del-btn")) {
          const eventElem = elem.parentElement.parentElement;
          const deleteId = eventElem.id;

          await eventAPIs.deleteEvent(deleteId);
          this.model.deleteEvent(deleteId);
          this.view.removeEventElem(deleteId);
        }
      });
    }
  
 
    setUpSubmitNewEvent() {

            this.view.eventList.addEventListener("click", async (e) => {
                // e.preventDefault();
                const elem = e.target;
                if (elem.classList.contains("event__save-btn")) {
                   
                  const eventElem = elem.parentElement.parentElement;
                 
                 const eventName = eventElem.querySelector('.name_new').value
                 const startDate = eventElem.querySelector('.event__start').value
                 const endDate = eventElem.querySelector('.event__end').value

                  if(eventName.length === 0 || startDate===''||endDate===''){
                   
                   
                    alert("Invalid data inputed!")
                    return;
                  } 
                  const startDateInput = new Date(startDate);
                  const endDateInput = new Date(endDate);
                  if(startDateInput > endDateInput){
                    alert("End date must be after start date!")
                    return;
                  }

                const newEvent = await eventAPIs.addEvent({
                    eventName,
                    startDate,
                    endDate
                  });
                  this.model.addEvent(newEvent);
                  this.view.renderNewEvent(newEvent);
                  this.view.clearInput(eventElem.id);
                }
              });

      }
    setUpNewEvent(){
        this.view.addNewEvent.addEventListener("click", async (e) => {
            this.view.renderNewForm();
          });
    }
    setUpCancelEvent(){
        this.view.eventList.addEventListener("click", async (e) => {
            
            const elem = e.target;
            if (elem.classList.contains("event__cancel-btn")) {
              const eventElem = elem.parentElement.parentElement;
              this.view.clearInput(eventElem.id);
            }
          });
    }
    setUpEditEvent(){
        this.view.eventList.addEventListener("click", async (e) => {
          
            const elem = e.target;
            if (elem.classList.contains("event__edit-btn")) {
              const eventElem = elem.parentElement.parentElement;
             
              const eventName = eventElem.querySelector('.event__name').textContent
              const startDate = eventElem.querySelector('.event__start').textContent
              const endDate = eventElem.querySelector('.event__end').textContent
             
              eventElem.innerHTML = `      
              <input class="name_new" value="${eventName}">
              <input type="date" class="event__start" id="start_new" value=${startDate}>
              <input type="date" class="event__end" id="end_new" value=${endDate} >
              <div class="event__actions">
                  <button class="event__edit_save-btn">Save</button>
                  <button class="event__edit_cancel-btn">Cancel</button>
              </div>
              `
            }
          });
    }
    setUpEditSaveEvent(){
        this.view.eventList.addEventListener("click", async (e) => {
            // e.preventDefault();
            const elem = e.target;
            if (elem.classList.contains("event__edit_save-btn")) {
              const eventElem = elem.parentElement.parentElement;
              console.log(eventElem);
              const id = eventElem.id;
              const eventName = eventElem.querySelector('.name_new').value
              const startDate = eventElem.querySelector('.event__start').value
              const endDate = eventElem.querySelector('.event__end').value
              console.log(eventName,startDate,endDate);
              if(eventName.length === 0 || startDate===''||endDate===''){
                     
                alert("Invalid data inputed!")
                return;
              } 
              
              const startDateInput = new Date(startDate);
              const endDateInput = new Date(endDate);
              if(startDateInput > endDateInput){
                alert("End date must be after start date!")
                return;
              }
              const updatedEvent = await eventAPIs.updateEvent({
                id,
                eventName,
                startDate,
                endDate
              });
             
              this.model.updateEvent(updatedEvent);
              this.view.renderEditEvent(updatedEvent); 
            }
          });
    }
    setUpEditCancelEvent(){
        this.view.eventList.addEventListener("click", async (e) => {
            const elem = e.target;
            if (elem.classList.contains("event__edit_cancel-btn")) {
              const eventElem = elem.parentElement.parentElement;
              console.log(eventElem);
              const id = eventElem.id;
              const event = await eventAPIs.getEventById(id);
              console.log(event);
              this.view.renderEditEvent(event);
            }
          });
    }
  }
  
  const eventsView = new EventsView();
  const eventsModel = new EventsModel();
  const eventsController = new EventsController(eventsView, eventsModel);