class A {
	copy() {
		console.log('class A copy');
	}

	prepend() {
		console.log('class A prepend');
		this.copy();
	}

	append() {
		console.log('class A append');
		this.copy();
	}
}

class B extends A {
	copy() {
		console.log('class B copy');
	}

	prepend() {
		console.log('class B prepend');
		super.append();
	}

	append() {
		console.log('class B append');
		super.prepend();
	}
}

const a = new A();
a.append();

const b = new B();
b.append();
