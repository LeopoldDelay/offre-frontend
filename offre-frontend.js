   async function getOffers(){
    try{
      let first_card = true;
      const offer_card_list_display = document.getElementsByClassName('offer-card-wrapper')[0];
      const cross_sell_delimiter = document.getElementById('cross-sell-delimiter');
      const offer_card_empty = document.getElementsByClassName('offer-card')[0];
      const urlParams = new URLSearchParams(window.location.search); // TODO If no order id then redirect to a page 404
      const order_id = urlParams.get('order_id');
      if (!order_id) {
        window.location.href = './404';
        return '404';
      }
      let min_co2 = 99999;
      let min_price = 999999;
      let index_min;
      let index_min_price;
      let cross_sell_displayed = false;
      const response = await fetch(`https://devis.koncrete.fr/offers/order/${order_id}`, { method: 'GET' });
      const offers = await response.json();
      let should_display = true;
      console.log(offers);
      if (!offers[0]){
        window.location.href = './merci-pour-votre-demande';
        return false;
      }
      if (offers[0].order_unit === 'TON' && parseFloat(offers[0].product.quantity) < 10) should_display = false;
      if (offers[0].order_unit === 'M3' && parseFloat(offers[0].product.quantity) < 6) should_display = false;
      if (!should_display){
        document.getElementById('info-min-quantity').classList.remove('hidden');
        document.getElementsByClassName('button-payment')[0].classList.add('hidden');
      }
      offers.forEach((offer, index) => {
        if (parseFloat(offer.estimated_ecological_score) && parseFloat(offer.estimated_ecological_score) < min_co2){
          index_min = index;
          min_co2 = parseFloat(offer.estimated_ecological_score);
        }
        if (parseFloat(offer.total_price_ttc) < min_price){
            index_min_price = index;
            min_price = parseFloat(offer.total_price_ttc);
        }
      });
      offers.forEach((offer, index) => {
        const new_offer_card = offer_card_empty.cloneNode(true);
        if (first_card){
          offer_card_empty.remove();
          first_card = false;
          if (offer.relevance_score === '3') new_offer_card.getElementsByClassName('tag-moins-cher')[0].classList.remove('hidden');
          if (parseFloat(offer.relevance_score) < 3){
            cross_sell_displayed = true;
            document.getElementById('no-product-delimiter').classList.remove('hidden');
            document.getElementById('header-product-available').classList.add('hidden');
          }
       }
        if(!cross_sell_displayed && !first_card && parseFloat(offer.relevance_score) < 3 ){
          cross_sell_displayed = true;
          offer_card_list_display.appendChild(cross_sell_delimiter);
          cross_sell_delimiter.classList.remove('hidden');
          // cross_sell_delimiter.remove();
        }
        const title = new_offer_card.getElementsByClassName('offer-product-title')[0];
        title.innerText = `${offer.product.title}`
        const usage = new_offer_card.getElementsByClassName('offer-product-type')[0];
        offer.product.usage_name ? usage.innerText = `${offer.product.usage_name.split(',').slice(0,4).join(', ')}` : '';
        const origine = new_offer_card.getElementsByClassName('offer-product-origine')[0];
        origine.innerText = `${offer.product.chimie_name}`;      
         const distance = new_offer_card.getElementsByClassName('offer-product-distance')[0];
        distance.innerText = `Distance de production : ${offer.distance_approximative} km`;
        const delivery_type = new_offer_card.getElementsByClassName('offer-delivery-type')[0];
        delivery_type.innerText = `${offer.delivery.delivery_type}`;
        const total_price = new_offer_card.getElementsByClassName('full-price')[0];
        total_price.innerText = offer.total_price_ttc;
        const price_per_unit = new_offer_card.getElementsByClassName('price-per-unit')[0];
        price_per_unit.innerText = `Soit  ${offer.price_per_unit_ttc} € TTC / ${offer.order_unit}`;
        const image = new_offer_card.getElementsByClassName('offer-product-image')[0];
        image.src = offer.product.image_url;
        const button = new_offer_card.getElementsByClassName('button-payment')[0];
        button.setAttribute('offer_id', offer.ID);
        button.setAttribute('onclick','showDateSelector('+offer.ID+')');
        offer_card_list_display.appendChild(new_offer_card);
         if(index === index_min){
          new_offer_card.getElementsByClassName('tag-ecolo')[0].classList.remove('hidden');
        }
        if (index === index_min_price){
          new_offer_card.getElementsByClassName('tag-moins-cher')[0].classList.remove('hidden');
        }
      });
     }
     catch(error){
      console.log('Error : ', error);
      window.location.href  = './merci-pour-votre-demande';
      return false;
     }
  }
  async function getOrder(){
    const urlParams = new URLSearchParams(window.location.search);
    const order_id = urlParams.get('order_id');
    if (!order_id) {
      window.location.href = './404';
      return '404';
    }
    const response = await fetch(`https://devis.koncrete.fr/devis/${order_id}`, { method: 'GET' });
    const order = await response.json();
    console.log(order);
    document.getElementById('order-type').innerText = `${order.product.granulat_name}`;
    if(!order.product.granulo) document.getElementById('order-granulo').parentNode.classList.add('hidden');
    document.getElementById('order-granulo').innerText = `${order.product.granulo_demandee}`;
    if(!order.product.usage_name) document.getElementById('order-usage').parentNode.classList.add('hidden');
    document.getElementById('order-usage').innerText = `${order.product.usage_name}`;
    if(!order.product.chimie) document.getElementById('order-chimie').parentNode.classList.add('hidden');
    document.getElementById('order-chimie').innerText = `${order.product.chimie_name}`;
    if(!order.product.fabrication) document.getElementById('order-fabrication').parentNode.classList.add('hidden');
    document.getElementById('order-fabrication').innerText = `${order.product.fabrication_name}`;
    document.getElementById('order-delivery-address').innerText = `${order.delivery.delivery_address}`;
    document.getElementById('order-quantity').innerText = `${order.product.quantity} ${order.product.order_unit}`;
  }
  $('#date-finale-form').on('click', function( e ) {
    e.stopPropagation();
})
  function showDateSelector(offer_id){
  	document.getElementsByClassName('popup-wrapper')[0].classList.remove('hidden');
    document.getElementById('date-finale-form').setAttribute('offer_id', offer_id);
  }
  function hideDateSelector(){
  	document.getElementsByClassName('popup-wrapper')[0].classList.add('hidden');
  }
  document.getElementsByClassName('popup-wrapper')[0].setAttribute('onclick','hideDateSelector()');
  getOffers();
  getOrder();
	$('#date-finale-form').submit(function(e) {
  			e.preventDefault();
        const urlParams = new URLSearchParams(window.location.search);
        const order_id = urlParams.get('order_id');
        const data = {};
        $(this).serializeArray().forEach((e) => { data[e.name] = e.value; });
        console.log(data);
        const config = {
        	withCredentials: false,
          method: 'get',
          url: `https://devis.koncrete.fr/devis/${order_id}/${$(this).attr('offer_id')}/payment-link?Date=${data.Date}&creneau=${data.creneau}`,
          headers: {
            'Content-Type': 'application/json',
          },
        }
        axios(config)
        .then(function (response) {
          console.log(response.data);
          if(response.data && response.data.payment_link) window.location.href = response.data.payment_link;
          else window.location.href = response.data.payment_link;
        })
        .catch(function (error) {
          console.log(error);
        })
        return false;
    }); 
    $('#matin').click(function(){
    	$(this).parent().addClass('is-active');
      $('#apresmidi').parent().removeClass('is-active');
    })
    $('#apresmidi').click(function(){
    	$(this).parent().addClass('is-active');
      $('#matin').parent().removeClass('is-active');
    })
    $(document).ready(function () {
    		var now = Date.now();
        var date_now = new Date;
        var today = date_now.getDay();
        $('[data-toggle="datepicker"]').datepicker({
            format: 'dd-mm-yyyy',
            language: 'fr-FR',
            filter: function(date, view) {
            if ((date.getDay() === 0 || date.getDay() === 6) && view === 'day') {
              return false;
            } 
            if ((date <= now) && view === 'day') {
              return false; 
            }
            if(date < now + 345600000){
              if((today === 0 || today === 6) && date.getDay() === 1) return false;
              if(today === 1 && (date.getDay() === 2 || date.getDay() === 3 || date.getDay() === 4)) return false;
              if(today === 2 && (date.getDay() === 3 || date.getDay() === 4 || date.getDay() === 5)) return false;
              if(today === 3 && (date.getDay() === 4 || date.getDay() === 5 || date.getDay() === 1)) return false;
              if(today === 4 && (date.getDay() === 5 || date.getDay() === 1 || date.getDay() === 2)) return false;
              if(today === 5 && (date.getDay() === 1 || date.getDay() === 2 || date.getDay() === 3)) return false;
          }
        }});
        $(document).on('pick.datepicker', function (e) {
        	$('[data-toggle="datepicker"]').datepicker('hide');
        });
    });
