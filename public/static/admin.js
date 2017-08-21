//var namespace = '/test';

// Connect to the Socket.IO server.
// The connection URL has the following format:
//     http[s]://<domain>:<port>[/<namespace>]
var socket = io.connect();//location.protocol + '//' + document.domain + ':' + location.port + namespace);

class Items extends React.Component {
  mystate = {
    start:0,
    limit:5,
    baoxiang:"",
    logined: false,
    search:""
  }
   state = {
      contacts: [],
      user: "AnonymousUser",
      start:0,
      total:0,
      search:"",
      start_input:1,
      showModal: false,
      error:"",
      lbls:[],
      values:[],
      newPackName: '',
      newname:"",
      auto_value: '',
      auto_items:[],
      auto_loading: false,
  }
  close=()=>{
    this.setState({ showModal: false });
  }
  componentDidMount=() => {
         this.setState({ showModal: true });
         this.loaddata();
  }
    _messageRecieve=(msgs)=>{
        this.setState({contacts:msgs});
    }
    _deleteId=(data)=>{
        var {success,id}=data
        const filteredFoods = this.state.contacts.filter(
          (item, idx) => item.id !== id,
        );
        this.setState({contacts: filteredFoods });
    }
   _initialize=(data)=>{
        console.log("init=====");
        console.log(data);
        var {users, name,msgs} = data;
        this.setState({users, user: name,contacts:msgs});
    }
  loaddata=()=>{
         console.log("emit");
         socket.emit( '/get/Item', {start:this.mystate.start,limit:this.mystate.limit,search:this.mystate.search}, (response)=>{
            console.log(response);
            if( response.success ){
               this.setState({contacts:response.data});
               this.setState({total:response.total});
            } else {
                if( response.error ) {
                }
            }
        });
  }
  handlePrev = (e) => {
    this.mystate.start=this.mystate.start-this.mystate.limit;
    if(this.mystate.start<0) {this.mystate.start=0;}
    //this.setState({start:start});
    this.loaddata();
  };
  handleNext = (e) => {
    this.mystate.start=this.mystate.start+this.mystate.limit;
    if(this.mystate.start>this.mystate.total-this.mystate.limit) 
        this.mystate.start=this.mystate.total-this.mystate.limit;//total >limit
    if(this.mystate.start<0)
    {
      this.mystate.start=0;
    }
    this.loaddata();
  };
  jump=()=>{
    this.mystate.start=parseInt(this.state.start_input,10)-1;
    if(this.mystate.start>this.mystate.total-this.mystate.limit) 
        this.mystate.start=this.mystate.total-this.mystate.limit;//total >limit
    if(this.mystate.start<0)
    {
      this.mystate.start=0;
    }
    this.loaddata();
  };
  handlePageChange= (e) => {
    this.setState({start_input:e.target.value});
  }
  onDeleteClick=(id)=>{
    socket.emit('delete:id',id)
  }
  mapfunc=(contact, idx) => {
        return (<tr key={idx} >
          <td>{contact.id}</td>
          <td>{contact.name}</td>
          <td>{contact.bh}</td>
          <td>{contact.guige}</td>
          <td><button onClick={() => this.onDeleteClick(contact.id)}>delete</button></td>
        </tr>);
  }
  render=()=>{
    const contactRows = this.state.contacts.map(this.mapfunc);
    return (
          <div>
          <p>Items</p>
           <table responsive bordered condensed><thead>
           <tr>
           <th>ID</th>
           <th>name</th>
           <th>bh</th>
           <th>guige</th>
           <th>actions</th>
           </tr></thead><tbody id="contact-list">{contactRows}</tbody></table>
      <a onClick={this.handlePrev}>前一页</a> 
      <label id="page">{this.state.start+1}/{this.state.total}</label>
      <a onClick={this.handleNext}>后一页</a>
      <input maxLength="6" size="6" onChange={this.handlePageChange} value={this.state.start_input} />
      <button id="page_go"  className="btn btn-info" onClick={this.jump}>跳转</button>
          </div>
    );
  }
};

ReactDOM.render(<Items />, document.getElementById('app'));