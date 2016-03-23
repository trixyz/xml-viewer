<?

require_once('XMLStorage.php');

$xml_string_example = <<< XM
<?xml version="1.0"?>
<Root attr1="1" attr2="2">
	<ChildOfRoot childAttr="child">
		<ChildOfChild>Child 1</ChildOfChild>
		<ChildOfChild>Child 2</ChildOfChild>
	</ChildOfRoot>
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
$result = $xml->link->query('SELECT * FROM tag');
$a = new SimpleXMLElement($xml_string_example);
$parsed_xml = $xml->parseXMLString($xml_string_example);
foreach ($parsed_xml as $key => $value) {
    echo $key;
    echo ' => ';
    print_r($value);
    if(array_key_exists('attributes', $value)){
        if(!($value['attributes']->__toString()==='')){
            echo '<br>';
            foreach ($value['attributes'] as $key => $value) {
                echo $key;
                echo ' => ';
                echo $value;
                # code...
            }
        }
    }
    echo '<br>';
}



