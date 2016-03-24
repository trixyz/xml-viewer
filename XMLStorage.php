<?

class XMLStorage{

    public $link;

    public function __construct(){

        $settings = parse_ini_file('config.ini');
        $this->link = new PDO($settings['db_name'], $settings['user'] , $settings['pass'],array(PDO::ATTR_PERSISTENT => true));

    }


    public function parseXMLString($xml_string){
        /**Gets XML as the argument and saves it to database tables:
        *a. tag (id, name,value,fileid)
        *b. attr (id,tag_id,name,value)
        */
        return $this->makeXML('string', $xml_string);
        
    }

    private function parseXML($sxe){//parse SimpleXMLElement

        $result[] = ['tag' => $sxe->getName(), 'value' => $sxe->asXML(),
                        'attributes'=>$sxe->attributes()];//get root tag
        $this->parseRecursively($sxe, $result);//get remaining

        $file_id = $this->getRandomName(10);//generate filename

        foreach ($result as $value) {
            //insert tag into db
            $tag = $this->link->quote($value['tag']);
            $value_of_tag = $this->link->quote($value['value']);
            $query = "INSERT INTO tag (name, value, file_id)
                            VALUES ($tag, $value_of_tag, $file_id)";
            $query = $this->link->query($query);
            //insert attributes (if exists) into db
            if(!($value['attributes']->__toString === '')){
                $id = $this->link->lastInsertId();
                foreach ($value['attributes'] as $key => $value) {
                    $attr = $this->link->quote($key);
                    $attr_value = $this->link->quote($value);
                    $query = "INSERT INTO attr (tag_id, name, value)
                                VALUES ($id, $attr, $attr_value)";
                    $query = $this->link->query($query);
                }
            }
        }

        return 'File uploaded successfuly! file_id: '.$file_id;
        
    }

    private function parseRecursively($node,&$data, $parent=0){
        $count = 0;
        $parent +=1;
        foreach ($node as $value) {
            $count++;
            if ($count>0){
                $data[] = ['tag' => $value->getName(), 'value'=>$value->asXML(), 
                            'attributes'=>$value->attributes(), 'parent_node_id' => $parent];
                $this->parseRecursively($value, $data, $parent);
            }
            
        }
    }

    public function parseXMLFile($xml_file_path){
        /**Loads xml from the file and saves into the same database (see #1)
        *Params:
        *i. file_path  - XML file path
        */
        return $this->makeXML('file', $xml_file_path);
    }

    private function makeXML($way,$xml){
        if ($way=='file'){
            $xml = simplexml_load_file($xml);
        } else {
            $xml = simplexml_load_string($xml);
        }
        if($xml){
            return $this->parseXML($xml);
        } else {
            $error = "File upload failed!\n";
            foreach(libxml_get_errors() as $errors) {
                $error .= $errors->message."\n";
            }
            return $error;
        }
    }

    public function outputXMLFromId($file_id, $tag_id=NULL){
        /**Outputs XML from database starting from tag specified by id attribute value (not id field in db table)
        *Params:
        *i. tag_id  - XML file id
        *ii. XML tag id (if missed – start from top) 
        */

        $file_id = $this->link->quote($file_id);
        if($tag_id==NULL){
            $query = "SELECT *, min(id) FROM tag WHERE file_id=$file_id;";
            $result = $this->link->query($query);
            $row = $result->fetch(PDO::FETCH_ASSOC);
        } else {
            $tag_id = $this->link->quote($tag_id);
            $query = "SELECT * FROM tag WHERE id=$tag_id and file_id=$file_id;";
            $result = $this->link->query($query);
            $row = $result->fetch(PDO::FETCH_ASSOC);
        }
        if(!($row)){
            return "we don't have such a tag";
        }
        return $row['value'];

       

    }


    public function getRandomName($length){
        $name = '';
        for ($i = 0; $i < $length; $i++){
            $name .= chr(rand(65,90));
        }
        return "'".$name."'";
    }


}