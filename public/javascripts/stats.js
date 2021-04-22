window.onload = function () {
    var thedata1 = [];
    var thedata2=[];
    var thedata3=[];
    var thedata4=[];
    var months=["January","February","March","April","May","June","July","August","October","November","December"];
    $.getJSON("/catalog/statistics/BookingsPerResource", function (items) {
        $.each(items.BooksperResource, function (index, value) {
            thedata1.push({
                label: value.label,
                y: parseInt(value.y)
            });

        });

        $.each(items.BooksperMonth,function (index,value){
            thedata2.push({
                label:value._id.year+' '+months[value._id.month-1],
                y:parseInt(value.count)
            });

        });
        $.each(items.AverageTimePerResource,function (index,value){
            thedata3.push({
                label:value.label[0],
                y:value.y
            });

        });
        $.each(items.AvgIncomePerResource,function (index,value){
            thedata4.push({
                label:value._id[0],
                y:value.cost
            });

        });

        console.log(thedata1)
        console.log(thedata2)
        console.log(thedata3)
        var chart = new CanvasJS.Chart("chartContainer1", {
            theme: "light1", // "light2", "dark1", "dark2"
            animationEnabled: true, // change to true
            title: {
                text: ""
            },
            data: [
                {
                    // Change type to "bar", "area", "spline", "pie",etc.
                    type: "bar",
                    dataPoints: thedata1
                }
            ]
        });
        var chart1 = new CanvasJS.Chart("chartContainer2", {
            theme: "light1", // "light2", "dark1", "dark2"
            animationEnabled: true, // change to true
            title: {
                text: ""
            },
            data: [
                {
                    // Change type to "bar", "area", "spline", "pie",etc.
                    type: "column",
                    dataPoints: thedata2
                }
            ]
        });
        var chart2 = new CanvasJS.Chart("chartContainer3", {
            theme: "light1", // "light2", "dark1", "dark2"
            animationEnabled: true, // change to true
            title: {
                text: ""
            },
            data: [
                {
                    // Change type to "bar", "area", "spline", "pie",etc.
                    type: "pie",
                    yValueFormatString: "##0.00\" Hours\"",
                    dataPoints: thedata3
                }
            ]
        });

        var chart3 = new CanvasJS.Chart("chartContainer4", {
            theme: "light1", // "light2", "dark1", "dark2"
            animationEnabled: true, // change to true
            title: {
                text: ""
            },
            data: [
                {
                    // Change type to "bar", "area", "spline", "pie",etc.
                    type: "doughnut",
                    yValueFormatString: "##0.00\" Euros\"",
                    dataPoints: thedata4
                }
            ]
        });
        chart.render();
        chart1.render();
        chart2.render();
        chart3.render();
    })
}