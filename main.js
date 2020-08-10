import { ToyReact, Component } from "./ToyReact";

console.log('main.js')

class MyComponent extends Component{
  render(){
    return <div>
      <span>Hello</span>
      <span>World</span>
      {this.children}
    </div>
  }
}

// let a = <div name='a'>
//   <span>Hello</span>
//   <span>World</span>
// </div>

// document.body.appendChild(a)

let a = <MyComponent name='a'>
  <div>123</div>
</MyComponent>
ToyReact.render(
  a,
  document.body
)
