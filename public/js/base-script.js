require([
  "esri/Map",
  "esri/views/MapView",
  "esri/Graphic",
  "esri/geometry/Point",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/widgets/Locate",
  "esri/widgets/Search",
  "esri/layers/FeatureLayer",
  "esri/views/SceneView",
  "esri/widgets/Expand",
  "esri/widgets/BasemapGallery",
  "esri/widgets/Legend",
  "esri/widgets/Track",
  "esri/widgets/Fullscreen",
  "dojo/domReady!"
], function (Map, MapView, Graphic, Point, SimpleMarkerSymbol, Locate, Search, FeatureLayer, SceneView, Expand, BasemapGallery, Legend, Track, Fullscreen) {

  var pointGraphic;
  var i;
  var planData = [];
  var advisorList = [];
  var advisorsInJulyList = [];
  var advisorsNotInJuly = [];
  var map = new Map({
    basemap: "dark-gray-vector"
  });

  var view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-97.13640739999994, 35.554689500000052],
    zoom: 4
  });

  var basemapGallery = new BasemapGallery({
    view: view,
    container: document.createElement("div")
  });

  var bgExpand = new Expand({
    view: view,
    content: basemapGallery
  });

  basemapGallery.watch("activeBasemap", function () {
    var mobileSize = view.heightBreakpoint === "xsmall" || view.widthBreakpoint === "xsmall";

    if (mobileSize) {
      bgExpand.collapse();
    }
  });

  var legend = new Expand({
    content: new Legend({
      view: view,
      style: "classic"
    }),
    view: view,
    expanded: false
  });

  view.ui.add(legend, "bottom-right");

  view.ui.add(bgExpand, "bottom-right");

  var search = new Search({
    view: view,
    sources: [{
      featureLayer: new FeatureLayer({
        url: "https://services.arcgis.com/DO4gTjwJVIJ7O9Ca/arcgis/rest/services/GeoForm_Survey_v11_live/FeatureServer/0",
        outFields: ["*"]
      }),
      searchFields: ["Email", "URL"],
      displayField: "Email",
      exactMatch: false,
      outFields: ["*"],
      name: "Plan",
      placeholder: "Demo: Search Plans",
      maxResults: 6,
      maxSuggestions: 6,
      suggestionsEnabled: true,
      minSuggestCharacters: 0
    },
    {
      featureLayer: new FeatureLayer({
        url: "https://services.arcgis.com/DO4gTjwJVIJ7O9Ca/arcgis/rest/services/GeoForm_Survey_v11_live/FeatureServer/0",
        outFields: ["*"]
      }),
      searchFields: ["Email", "URL"],
      displayField: "Email",
      exactMatch: false,
      outFields: ["*"],
      name: "Advisors",
      placeholder: "Demo: Search Advisors",
      maxResults: 6,
      maxSuggestions: 6,
      suggestionsEnabled: true,
      minSuggestCharacters: 0
    }]
  });

  var locate = new Locate({
    view: view
  });

  view.ui.add(locate, "top-left");

  view.ui.add(search, {
    position: "top-right",
    index: 2
  });

  var drawPointsOnMap = function (item, template) {
    pointGraphic = new Graphic({
      geometry: getLatLang(item),
      symbol: getSymbol(item),
      attributes: getAttributes(item),
      popupTemplate: template
    });
    view.graphics.add(pointGraphic);
  }

  var drawMap = function (list, template) {
    list.forEach(function (listItem) {
      drawPointsOnMap(listItem, template);
    })
  }

  var getLatLang = function (item) {
    if (item.location_x && item.location_y) {
      return new Point({
        longitude: item.location_x,
        latitude: item.location_y
      });
    }
    else if (item.latitude && item.longitude) {
      return new Point({
        longitude: item.longitude,
        latitude: item.latitude
      });
    }
  }

  var getAttributes = function (item) {
    if (item.InSystem) {
      return {
        name: item.Name,
        company: item.Company,
        email: item.Email,
        phone: item.Phone,
        city: item.City,
        address: item.Address,
        InSystem: item.InSystem,
        state: item.State,
        zip: item.Zip,
        latitude: item.latitude,
        longitude: item.longitude,
        item: JSON.stringify(item)
      };
    }
    else {
      return {
        name: item.Name,
        startDate: item.Date,
        product: item.Product,
        picture: item.picture,
        fees: item.Fees,
        address: item.Address,
        isJulyAdvisor: item.isJulyAdvisor,
        item: JSON.stringify(i)
      };
    }
  }

  var getSymbol = function (item) {
    if (item.InSystem) {
      if (item.InSystem == 'Yes') {
        return greenMarkerSymbol;
      }
      else if (item.InSystem == 'No') {
        return yellowMarkerSymbol;
      }
    }
    else {
      return planMarkerSymbol;
    }
  }

  var greenMarkerSymbol = new SimpleMarkerSymbol({
    color: [4, 153, 12],
    size: 7
  });

  var yellowMarkerSymbol = new SimpleMarkerSymbol({
    color: [255, 255, 112],
    size: 7
  });

  var planMarkerSymbol = new SimpleMarkerSymbol({
    color: [66, 170, 244],
    size: 7,
    style: "diamond"
  });

  search.includeDefaultSources = true;

  var toggleEntity = function (category) {
    console.log(category);
    switch (category) {
      case 'Advisors in July':
        view.popup.close();
        view.graphics.removeAll();
        getAdvisorData(category);
        break;
      case 'Advisors not in July':
        view.popup.close();
        view.graphics.removeAll();
        getAdvisorData(category);
        break;
      case 'Plans in July':
        view.popup.close();
        view.graphics.removeAll();
        drawMap(planData, planPopupTemplate);
        break;
      case 'All Advisors':
        view.popup.close();
        view.graphics.removeAll();
        getAdvisorData(category);
        break;
    }
  }

  var entityTypes = ["Plans in July", "Advisors in July", "Advisors not in July", "All Advisors"];

  var select = document.createElement("select", "");
  entityTypes.forEach(function (p) {
    var option = document.createElement("option");
    option.value = p;
    option.innerHTML = p;
    select.appendChild(option);
  });

  view.ui.add(select, "bottom-left");

  select.addEventListener('change', function (event) {
    toggleEntity(event.target.value);
  });

  /*function getItemsWithLocation(value) {
  if(value.location)
  return value;
  }*/

  view.popup.watch("selectedFeature", function (graphic) {
    if (graphic) {
      var graphicTemplate = graphic.getEffectivePopupTemplate();
      if (graphicTemplate.actions)
        graphicTemplate.actions.items[0].visible = graphic.attributes.InSystem == 'Yes' ? false : true;
    }
  });

  view.popup.on("trigger-action", function (event) {
    if (event.action.id === "add-to-july") {
      addToJuly(event.target.content.graphic.attributes);
    }
  });

  function addToJuly(item) {
    view.graphics.remove(new Graphic({
      geometry: getLatLang(item)
    }));
  }

  var getPlanData = function () {
    fetch(planUrl)
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        planData = data;
        toggleEntity('Plans in July');
      });
  }

  var categoryWiseAdvisor = function (category) {
    if (category == 'Advisors in July') {
      drawMap(advisorList.filter(getJulyAdvisor), advisorPopupTemplate);
    }
    else if (category == 'Advisors not in July') {
      drawMap(advisorList.filter(getAdvisorNotJuly), advisorPopupTemplate);
    }
    else {
      drawMap(advisorList, advisorPopupTemplate);
    }
  }

  var getAdvisorData = function (category) {
    if (advisorList.length > 0) {
      categoryWiseAdvisor(category);
    }
    else {
      fetch(fetchAdvisorUrl)
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          advisorList = data;
          categoryWiseAdvisor(category);
        })
    }
  }

  function getJulyAdvisor(value) {
    if (value.InSystem == 'Yes')
      return value;
  }

  function getAdvisorNotJuly(value) {
    if (value.InSystem == 'No')
      return value;
  }

  getPlanData();

  /*var track = new Track({
  view: view
  });*/

  view.when(function () {
    //track.start();
    setLegends();
  });

  function setLegends() {
    var legendDiv = document.getElementsByClassName("esri-legend__message");
    legendDiv[0].innerHTML = "<p><i class='fa fa-circle text-green' aria-hidden='true'></i> Advisors in July </p>" +
      "<p><i class='fa fa-circle text-yellow' aria-hidden='true'></i> Advisors not in July </p>" +
      "<p><i class='fa fa-square  text-blue plan' aria-hidden='true'></i> Plans in July </p>";
    console.log(legendDiv[0].innerHTML);
  }

  view.ui.add(new Fullscreen({
    view: view,
    element: document.getElementById("viewDiv")
  }), "top-left");

});
