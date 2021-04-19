
document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'resourceTimeGridDay',
        initialDate: new Date(),
        formatDateTime:'DD/MM/YYYY HH:mm',
        eventColor:'forestgreen',
        slotWidth: 15,
        slotLabelFormat: "HH:mm",
        minTime: "09:30:00",
        maxTime: "20:00:00",
        slotLabelInterval: "00:30:00",
        slotLabelFormat:{
            hour: 'numeric',
            minute: '2-digit',
            omitZeroMinute: true,
            hour12:false

        },
        businessHours: {
            startTime: '08:00',
            endTime: '20:00'
        },
        schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'resourceTimeline,resourceTimeGridDay'
        },
        resources: '/catalog/resources/calendar/resources',
        events: '/catalog/resources/calendar/bookings'


    });

    calendar.render();
});