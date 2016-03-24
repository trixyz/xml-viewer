<?

require_once('XMLStorage.php');

$xml_string_example = <<< XM
<?xml version="1.0"?>
<Root attr1="1" attr2="2">
	<ChildOfRoot childAttr="child">
		<ChildOfChild>Child 1</ChildOfChild>
		<ChildOfChild>Child 2</ChildOfChild>
	</ChildOfRoot>
    <error text="error1"/>
</Root>
XM;
/*
if (isset($_GET['file_id'])){

	if (isset($_GET['id'])){
		XMLStorage::getXML($_GET['file_id'], $_GET['id']);
	} else {
		XMLStorage::getXML($_GET['file_id']);
	}

}*/


$xml = new XMLStorage();
$xml->parseXMLString($xml_string_example);

if (isset($_FILES)){
    print_r($_FILES);
}




