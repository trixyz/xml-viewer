/////////////////////////
///creating of a main div
/////////////////////////
function createUI(){

    var root = document.createElement('div');
    root.className = 'main';
    root.id = 'main';
    root.draggable = 'true';

    var input = document.createElement('input');
    input.className = 'input';
    input.id = 'input';
    input.type = 'url';
    input.value = 'http://localhost/xml-viewer/cd_catalog.xml';

    var upload = document.createElement('input');
    upload.className = 'upload';
    upload.id = 'upload';
    upload.accept = '.xml';
    upload.type = 'file';

    var view_area = document.createElement('div');
    view_area.className = 'view';
    view_area.id = 'view';

    var errors_view = document.createElement('div');
    errors_view.className = 'errors_view';
    errors_view.id = 'errors_view';

    var warnings_view = document.createElement('div');
    warnings_view.className = 'warnings_view';
    warnings_view.id = 'warnings_view';

    var button_get = document.createElement('button');
    button_get.id = 'get';
    button_get.innerText = 'GET';


    var button_post = document.createElement('button');
    button_post.id = 'post';
    button_post.innerText = 'POST';

    var button_upload = document.createElement('button');
    button_upload.id = 'button_upload';
    button_upload.innerText = 'Upload';


    var views_div = document.createElement('div');
    views_div.innerText = 'Views:';
    views_div.className = 'views_div';
    views_div.appendChild(makeLink('XML','#xml', 'xml_link'));
    views_div.appendChild(makeLink('Errors','#errors', 'errors_link'));
    views_div.appendChild(makeLink('Warnings','#warnings', 'warnings_link'));

    var status_div = document.createElement('div');
    status_div.id = 'status_div';
    status_div.innerText = 'Status:';

    var upload_status = document.createElement('div');
    upload_status.id = 'upload_status';
    upload_status.innerText = 'Upload status: '

    root.appendChild(input);
    root.appendChild(button_get);
    root.appendChild(button_post);
    root.appendChild(views_div);
    root.appendChild(status_div);
    root.appendChild(view_area);
    root.appendChild(errors_view);
    root.appendChild(warnings_view);
    root.appendChild(upload);
    root.appendChild(button_upload);
    root.appendChild(upload_status);
    return root;
}

/////////////////////
///DRAG'n'DROP///////
/////////////////////
function drag_start(event) {
    var style = window.getComputedStyle(event.target, null);
    event.dataTransfer.setData("text/plain",
    (parseInt(style.getPropertyValue("left"),10) - event.clientX) + ',' + (parseInt(style.getPropertyValue("top"),10) - event.clientY));
} 
function drag_over(event) { 
    event.preventDefault(); 
    return false; 
} 
function drop(event) { 
    var offset = event.dataTransfer.getData("text/plain").split(',');
    var dm = document.getElementById('main');
    dm.style.left = (event.clientX + parseInt(offset[0],10)) + 'px';
    dm.style.top = (event.clientY + parseInt(offset[1],10)) + 'px';
    event.preventDefault();
    return false;
} 


//////////////////////
///return a elements//
//////////////////////
function makeLink(text, url, id){
  var link = document.createElement('a');
  link.innerText = text;
  link.href = url;
  link.id = id;
  return link;
}

function makeRequest(url, method) {
  var xhttp = new XMLHttpRequest();
  document.getElementById('view').innerText = 'Loading....';
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      var html = formatXML(xhttp.responseText);
      if (html[0]=='error'){
        document.getElementById('view').innerText = 'Error: Invalid XML';
        document.getElementById('status_div').innerText = 'Status: INCORRECT DATA';
        document.getElementById('warnings_view').innerText = 'No data';
        document.getElementById('errors_view').innerText = 'No data';
        return 0;
      }
      document.getElementById('view').innerHTML = '<pre>' + html[0] +'</pre>';
      document.getElementById('status_div').innerText = 'Status: OK';
      document.getElementById('errors_view').style.display = 'none';
      document.getElementById('warnings_view').style.display = 'none';
      if (html[1][0]){
        document.getElementById('errors_view').innerHTML = '<pre>' + html[1][0] +'</pre>';
        document.getElementById('errors_link').innerText = 'Errors'+'('+html[1][1]+')';
      } else {
        document.getElementById('errors_view').innerText = 'No errors';
        document.getElementById('errors_link').innerText = 'Errors';
      }
      if (html[2][0]){
        document.getElementById('warnings_view').innerHTML = '<pre>' + html[2][0] +'</pre>';
        document.getElementById('warnings_link').innerText = 'Warnings'+'('+html[2][1]+')';
      } else {
        document.getElementById('warnings_view').innerText = 'No warnings';
        document.getElementById('warnings_link').innerText = 'Warnings';
      }
    } else {
      document.getElementById('view').innerText = 'Error ' + xhttp.status;
      document.getElementById('status_div').innerText = 'Status: ERROR';
    }
  };
  xhttp.open(method, url, true);
  xhttp.send();
}

function uploadFile(file){
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.status === 200) {
      upload_status.innerText = 'File uploaded succesefuly. Filename: ' + xhr.responseText;
    } else {
      upload_status.innerText = 'Upload failed: ' + xhr.status;
    }
  }
  xhr.open('POST', 'index.php', true);
  xhr.send(file);
}

//////////////////////////
///handlers for buttons///
//////////////////////////

function button_click_get(){
  var url = document.getElementById("input").value;
  makeRequest(url, "GET");
}

function button_click_post(){
  var url = document.getElementById("input").value;
  makeRequest(url, "POST");
}

function button_click_errors(){
  document.getElementById('warnings_view').style.display = 'none';
  document.getElementById('errors_view').style.display = 'inherit';
}

function button_click_warnings(){
  document.getElementById('errors_view').style.display = 'none';
  document.getElementById('warnings_view').style.display = 'inherit';
}

function button_click_xml(){
  document.getElementById('errors_view').style.display = 'none';
  document.getElementById('warnings_view').style.display = 'none';
}

function button_click_upload(){
  var upload_input = document.getElementById('upload');
  var file = upload_input.files[0];
  var form_data = new FormData();
  form_data.append('xml', file);
  uploadFile(form_data);
}


///////////////////////////
///get string with xml data
///and return array contains
///string with xml without
///error and warning tags,
///arrays with errors and
///warnings repsresented as
///strings and their quantity
////////////////////////////

function formatXML(xml){
  var parser = new DOMParser();
  xml = parser.parseFromString(xml,"text/xml");
  if(xml.getElementsByTagName("parsererror").length>0){
    return ['error'];
  }
  var errors = getParticularTag("error",xml);
  var warnings = getParticularTag("warning", xml);
  errors[0] = specialChars(errors[0]);
  warnings[0] = specialChars(warnings[0]);
  xml = new XMLSerializer().serializeToString(xml);
  xml = xml.replace(/(>)(<)/, '$1\n$2');
  xml = specialChars(xml);
  return [xml, errors, warnings];
}

function getParticularTag(tag,xml){
  var node_list = xml.getElementsByTagName(tag);
  node_list_length = node_list.length;
  var tags = [];
  for (var i = 0; i<node_list_length; i++){
    tags.push(node_list[0]);
    var y = xml.getElementsByTagName(tag)[0];
    xml.documentElement.removeChild(y);
  }
  tags_string = '';
  for (var value of tags ){
    if(tag=='error'){
      tags_string += 'Error: '+ value.getAttribute('text') +' Code: '+ value.getAttribute('code') + '\n';
    } else {
      tags_string += 'Warning: ' + value.getAttribute('text') + '\n';
    }
  }
  return [tags_string, node_list_length];
}


/////////////////////////
///replace html special
///chars to show it as is
/////////////////////////
function specialChars(str){
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').
  replace(/'/g, '&#039;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}



document.body.appendChild(createUI());

document.getElementById('get').addEventListener('click',button_click_get);
document.getElementById('post').addEventListener('click',button_click_post);
document.getElementById('button_upload').addEventListener('click',button_click_upload);

document.getElementById('xml_link').addEventListener('click', button_click_xml);
document.getElementById('errors_link').addEventListener('click',button_click_errors);
document.getElementById('warnings_link').addEventListener('click',button_click_warnings);

var draggable_div = document.getElementById('main'); 
draggable_div.addEventListener('dragstart',drag_start,false); 
document.body.addEventListener('dragover',drag_over,false); 
document.body.addEventListener('drop',drop,false); 
makeRequest("nonf.xml", "POST");
