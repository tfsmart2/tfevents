let currentAccount;
let lastTransactionTime;
let contractAddress;


 contractAddress = 'TFrBVjdpsuWQUMtjFpMxhUKg2q3oa6rgGv';
//contractAddress = 'TXdYyohKtHDrvfsaT5cd9SUGvymxVMqG1X'; //Shasta NetWork


const defaultSponsor = 'TGiyNohpFQcCauqqaePLtH8JSop3jBeRFn';
//const defaultSponsor = 'TLe7Y2D7w7a3iNdiwqnHnaSfNPFBBEN7tB'; //Shasta
let invested;
let connected = false;


window.addEventListener('message', (e) => {
  if (e.data?.message?.action == 'tabReply') {
    console.warn('tabReply event', e.data.message);
    if (e.data?.message?.data?.data?.node?.chain == '_') {
      console.info('tronLink currently selects the main chain');
    } else {
      console.info('tronLink currently selects the side chain');
    }
  } else if (e.data?.message?.action == 'setAccount') {
    //showPopup('Account Changed', 'success');
    console.warn('setAccount event', e.data.message);
    console.info('current address:', e.data.message.data.address);
  } else if (e.data?.message?.action == 'setNode') {
    console.warn('setNode event', e.data.message);
    if (e.data?.message?.data?.data?.node?.chain == '_') {
      console.info('tronLink currently selects the main chain');
    } else {
      console.info('tronLink currently selects the side chain');
    }
  }
});

/**
 *
 */
$(document).ready(async () => {
  const url = new URL(window.location);
  const params = new URLSearchParams(url.search);

  

  
  // console.log(xmlHttp.responseText);  


  var checkConnectivity = setInterval(async () => {
    if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
      // clearInterval(checkConnectivity);
      if (!connected) {
        showPopup('Connected to Tron LINK.', 'success');
        connected = true;
      }

      const tronWeb1 = window.tronWeb;
      currentAccount = tronWeb1.defaultAddress.base58;
      $('#address').text(currentAccount);
      const tronWeb = new TronWeb({
        fullHost: 'https://api.trongrid.io', //Change to main net
        privateKey: '53bdafc0bccd2c49f60305acaf3dd3634874101cf9b0c7e5abd3f8aeafc036e2' // Input your privateKey
      });

       

      

      const contract = await tronWeb.contract().at(contractAddress);

      

      getTotalInvested(contract);
      getTotalInvestors(contract);
      getContractBalanceRate(contract);
      getuserpayout(contract);
      getreferral(contract);
      invested = await getDeposit(contract);
      let profit, totalProfit, halfProfit;
      if (parseInt(invested) > 0) {
        profit = await getProfit(contract);

        totalProfit = (profit.toNumber() / 1000000).toFixed(6);
        halfProfit = (profit.toNumber() / 2000000).toFixed(6);

        $('#refererAddress').val('You Already have a Sponsor');
        $('#refererAddress').prop('disabled', true);

        $('#accountRef').val(
          window.location.hostname + '?ref=' + currentAccount
        );
      } else {
        if (params.has('ref')) {
          $('#refererAddress').prop('disabled', true);
          $('#refererAddress').val(params.get('ref'));
        } else if ($('#refererAddress').val() == 'You Already have a Sponsor') {
          $('#refererAddress').prop('disabled', false);
          $('#refererAddress').val('');
        }
        $('#accountRef').val(
          'You need to invest at least 50 TRX to activate the referral link.'
        );

        totalProfit = halfProfit = 0;
      }

      $('#withdrawableAmount').val(halfProfit);
      $('.deduction').text(halfProfit);
      $('#withdrawableInterest').val(halfProfit);
      $('#totalWithdrawable').val(totalProfit);
      $('#invested').text(totalProfit);
      $('#withdrawal').text((halfProfit / 2).toFixed(6));

      $('#reinvest-new-balance').text(
        parseFloat(
          parseFloat($('#actualCapital').val()) + parseFloat(halfProfit)
        ).toFixed(6)
      );
      $('#withdrawal-new-balance').text(
        parseFloat(
          parseFloat($('#actualCapital').val()) - parseFloat(halfProfit)
        ).toFixed(6)
      );

      getBalanceOfAccount();
      get_events(currentAccount); 
    } else {
      if (connected) {
        showPopup('Tron LINK is disconnected.', 'error');
        connected = false;
      }
    }
  }, 2000);
});
//----------------//

function get_events(address)
{
  theUrl = 'https://api.trongrid.io/v1/contracts/' + contractAddress + '/events?event_name=NewDeposit';

  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
  xmlHttp.send( null );
  // console.log("******************");

  
  let res = JSON.parse(xmlHttp.response);


  hex_address = tronWeb.address.toHex(address);

  wallet_address = '0x' + hex_address.slice(2);
  
  var i = 0;


  create_events_table(res['data'],wallet_address);

}

function create_events_table(data,wallet_address)
{
  var myTableDiv = document.getElementById("events_table");
  while (myTableDiv.hasChildNodes()) {  
    myTableDiv.removeChild(myTableDiv.firstChild);
  }

  var table = document.createElement('TABLE');
  table.border = '1';
  table.style.color = 'white';
  table.style.padding = '5px';

  var tableBody = document.createElement('TBODY');

  let thead = document.createElement('thead');
  let thr = document.createElement('tr');
  
  
  let th1 = document.createElement('th');
  let th2 = document.createElement('th');
  let th3 = document.createElement('th');
  th1.appendChild(document.createTextNode("Amount"));
  thr.appendChild(th1);
  
  th2.appendChild(document.createTextNode("Date"));
  thr.appendChild(th2);
  th3.appendChild(document.createTextNode("Txid"));
  thr.appendChild(th3);
  
  thead.appendChild(thr);
  table.appendChild(thead);
  table.appendChild(tableBody);

  total_deposit = 0;

  for (var i = 0; i < data.length; i++) {
    if(data[i]['result']['user'] == wallet_address){
      total_deposit += parseInt(data[i]['result']['amount']);
      var tr = document.createElement('TR');
      tableBody.appendChild(tr);    

      var td1 = document.createElement('TD');
      var td2 = document.createElement('TD');
      var td3 = document.createElement('TD');
      
      
      td1.appendChild(document.createTextNode(tronWeb.fromSun(parseInt(data[i]['result']['amount']))));
      tr.appendChild(td1);
      time = format_time(parseInt(data[i]['result']['_time']) );
      td2.appendChild(document.createTextNode(time));
      tr.appendChild(td2);
      td3.appendChild(document.createTextNode(data[i]['transaction_id']));
      tr.appendChild(td3);

    }
    
    
  }
  myTableDiv.appendChild(table);
  total_amount = tronWeb.fromSun(total_deposit);
  $("#total_deposit").text(total_amount);
}

function format_time(timestamp)
{
  let unix_timestamp = timestamp
// Create a new JavaScript Date object based on the timestamp
// multiplied by 1000 so that the argument is in milliseconds, not seconds.
  var date = new Date(unix_timestamp * 1000);
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();
  
  // Hours part from the timestamp
  var hours = date.getHours();
  // Minutes part from the timestamp
  var minutes = "0" + date.getMinutes();
  // Seconds part from the timestamp
  var seconds = "0" + date.getSeconds();

  // Will display time in 10:30:23 format
  var formattedTime = year + '-' + month + '-' + day + '-' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
  return formattedTime;
}
async function getBalanceOfAccount() {
  return tronWeb.trx.getBalance(currentAccount).then((res) => {
    const balance = parseInt(res / 1000000);
    if (balance) {
      $('#balance').text(balance);
    } else {
      $('#balance').text(0);
    }
  
      
    return balance;
  });
}
async function deposit() {
  let address = $('#refererAddress').val();
  let amount = $('#depositAmount').val();
  const contract = await tronWeb.contract().at(contractAddress);
  if (!tronWeb.isAddress(address) && parseInt(invested) < 1) {
    showPopup('Please Enter Right Address', 'error');
  } else if (amount < 50) {
    showPopup('Minimum Amount is 50 TRX', 'error');
  } else if (amount > (await getBalanceOfAccount())) {
    showPopup('Insufficient Balance', 'error');
  } else {
    if (parseInt(invested) > 0) {
      address = defaultSponsor;
    }
    if (window.tronWeb) {
      let contract = await tronWeb.contract().at(contractAddress);
      contract
        .deposit(address)
        .send({
          callValue: tronWeb.toSun(amount),
        })
        .then((output) => {
          console.info('Hash ID:', output, '\n');
          showPopup('Deposit Successful', 'success');
        });
    } else {
      showPopup('TronWeb is not Connected', 'error');
    }
  }
}
//withDraw your fund!
async function withdraw() {
  if (window.tronWeb) {
    let contract = await tronWeb.contract().at(contractAddress);
    await contract
      .withdraw()
      .send()
      .then((output) => {
        getBalanceOfAccount();
        console.info('HashId:' + ' ' + output);
        showPopup('Withdraw Successful', 'success');
      });
  } else {
    showPopup('TronWeb is not Connected', 'error');
  }
}
//reinvest your fund!
async function reinvest() {
  if (window.tronWeb) {
    let contract = await tronWeb.contract().at(contractAddress);
    await contract
      .reinvest()
      .send()
      .then((output) => {
        console.info('HashId:' + ' ' + output);
        showPopup('Reinvest Successful', 'success');
      });
  } else {
    showPopup('TronWeb is not Connected', 'error');
  }
}

/**
 * get total Invested
 * @param {*} contract
 */
async function getTotalInvested(contract) {
  let totalInvested = await contract.totalInvested().call();
  $('#totalInvested').text(
    thousands_separators(parseInt(totalInvested.toNumber() / 1000000))
  );
}

/**
 * get total Investors
 * @param {*} contract
 */
async function getTotalInvestors(contract) {
  let totalInvestors = await contract.totalPlayers().call();
  $('#totalInvestors').text(totalInvestors.toNumber());
}



/**
 * get Contract Balance Rate
 * @param {*} contract
 */
async function getContractBalanceRate(contract) {
  let contractbalanceRate = await contract.getContractBalanceRate().call();
  $('#roi').text((contractbalanceRate.toNumber() / 10 + 1).toFixed(1));
}


/**
 * get user payout 
 * @param {*} contract
 */
async function getuserpayout(contract) {
  let invester = await contract.players(currentAccount).call();
    const userpayout = invester.payoutSum.toNumber() / 1000000;
    $('#userpayout').text(userpayout.toFixed(2));
  
}

/**
 * get user referral info 
 * @param {*} contract
 */
async function getreferral(contract) {
  let invester = await contract.players(currentAccount).call();
    const refrewards = invester.affRewards.toNumber() / 1000000;
    const aff1 = invester.aff1sum.toNumber();
    const aff2 = invester.aff2sum.toNumber();
    const aff3 = invester.aff3sum.toNumber();
    const aff4 = invester.aff4sum.toNumber();
    $('#refrewards').text(refrewards.toFixed(2));
    $('#aff1').text(aff1);
    $('#aff2').text(aff2);
    $('#aff3').text(aff3);
    $('#aff4').text(aff4);
  
}





/**
 * get Deposit /and values of payout referral rewards and referral account
 * @param {*} contract
 */
async function getDeposit(contract) {
  let invester = await contract.players(currentAccount).call();
  const deposit = invester.trxDeposit.toNumber() / 1000000;
//  const userpayout = invester.payoutSum.toNumber() / 1000000;
  const refrewards = invester.affRewards.toNumber() / 1000000;
  const aff1 = invester.aff1sum.toNumber();
  const aff2 = invester.aff2sum.toNumber();
  const aff3 = invester.aff3sum.toNumber();
  const aff4 = invester.aff4sum.toNumber(); 
  if (deposit > 0) {
    $('#actualCapital').val(deposit.toFixed(6));
  } else {
    $('#actualCapital').val(0);
  }
  



/*if (userpayout > 0) {
    $('#uspayout').val(userpayout.toFixed(2));
  } else {
    $('#uspayout').val(0);
  } */

if (refrewards > 0) {
    $('#usrefrewards').val(refrewards.toFixed(2));
  } else {
    $('#uspayout').val(0);
  }

if (aff1 > 0) {
    $('#usaff1').val(aff1);
  } else {
    $('#usaff1').val(0);
  }

if (aff2 > 0) {
    $('#usaff2').val(aff2);
  } else {
    $('#usaff2').val(0);
  }

if (aff3 > 0) {
    $('#usaff3').val(aff3);
  } else {
    $('#usaff3').val(0);
  }

if (aff4 > 0) {
    $('#usaff4').val(aff4);
  } else {
    $('#usaff4').val(0);
  }


  return deposit.toFixed(6);
}

/**
 *
 * @param {*} contract
 */
async function getProfit(contract) {
  return await contract.getProfit(currentAccount).call();
}

function copy() {
  /* Get the text field */
  var copyText = document.getElementById('accountRef');

  /* Select the text field */
  copyText.select();
  copyText.setSelectionRange(0, 99999); /*For mobile devices*/

  /* Copy the text inside the text field */
  document.execCommand('copy');

  showPopup('Copied', 'success');
}

function thousands_separators(num) {
  var num_parts = num.toString().split('.');
  num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return num_parts.join('.');
}

/**
 * show Popup
 * @param {*} error
 */
function showPopup(msg, type) {
  $(`#popup-${type}-msg`).html(msg);

  $('.popup').removeClass('show');

  $(`.${type}-popover`).addClass('show');
  window.setTimeout(() => {
    $(`.${type}-popover`).removeClass('show');
  }, 3 * 1000);
}
