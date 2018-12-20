import React, { Component, Fragment } from "react";
import IntlMessages from "Util/IntlMessages";
import {
	Row,
	Card,
	CustomInput,
	Button,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	ButtonDropdown,
	UncontrolledDropdown,
	Collapse,
	DropdownMenu,
	DropdownToggle,
	DropdownItem,
	Input,
	CardBody,
	CardSubtitle,
	CardImg,
	Label,
	CardText,
	Badge
} from "reactstrap";
import Select from "react-select";
import { NavLink } from "react-router-dom";

import CustomSelectInput from "Components/CustomSelectInput";

import { Colxx, Separator } from "Components/CustomBootstrap";
import BreadcrumbContainer from "Components/BreadcrumbContainer";
import Pagination from "Components/List/Pagination";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import { database } from "../../../firebase";
import classnames from "classnames";
import moment from "moment";
import './styles.css'

export default class extends Component {
	state = {
		displayMode: "list",
		pageSizes: [10, 20, 30, 50, 100],
		selectedPageSize: 10,
		categories: [
			{ label: 'Cakes', value: 'Cakes', key: 0 },
			{ label: 'Cupcakes', value: 'Cupcakes', key: 1 },
			{ label: 'Desserts', value: 'Desserts', key: 2 },
		],
		orderOptions: [
			{ column: "name", label: "Nombre" },
			{ column: "creationTime", label: "Creacion" },
			{ column: "active", label: "Status" }
		],
		selectedOrderOption: { column: "name", label: " Nombre" },
		dropdownSplitOpen: false,
		modalOpen: false,
		currentPage: 1,
		totalItemCount: 0,
		totalPage: 1,
		search: "",
		selectedItems: [],
		lastChecked: null,
		displayOptionsIsOpen: false,
		isLoading: false,
		users: []
	};

	componentDidMount = () => {
		database.collection('USERS').orderBy('email').get().then(res => {
			this.setState({
				users: res.docs
			})
		})
	}

	toggleSplit = () => {
		this.setState(prevState => ({
		  dropdownSplitOpen: !prevState.dropdownSplitOpen
		}));
	  }

	onContextMenuClick = (e, data, target) => {
		console.log("onContextMenuClick - selected items",this.state.selectedItems)
		console.log("onContextMenuClick - action : ", data.action);
	  };
  
	  onContextMenu = (e, data) => {
		const clickedProductId = data.data;
		if (!this.state.selectedItems.includes(clickedProductId)) {
		  this.setState({
			selectedItems :[clickedProductId]
		  });
		}
  
		return true;
	  };

	  handleKeyPress = (e) => {
		this.setState({
			search: e.target.value
		})

		if(e.target.value.length === 0){
			database.collection('USERS').get().then(res => {
				this.setState({
					users: res.docs
				})
			})
		} else{
			database.collection('USERS').where('email', '>', e.target.value).get().then(res => {
				this.setState({
					users: res.docs
				})
			})
		}
		
	  }
	  handleCheckChange(event, id) {
		if (
		  event.target.tagName == "A" ||
		  (event.target.parentElement &&
			event.target.parentElement.tagName == "A")
		) {
		  return true;
		}
		if (this.state.lastChecked == null) {
		  this.setState({
			lastChecked: id
		  });
		}
  
		let selectedItems = this.state.selectedItems;
		if (selectedItems.includes(id)) {
		  selectedItems = selectedItems.filter(x => x !== id);
		} else {
		  selectedItems.push(id);
		}
		this.setState({
		  selectedItems
		});
  
		if (event.shiftKey) {
		  var items = this.state.items;
		  var start = this.getIndex(id, items, "id");
		  var end = this.getIndex(this.state.lastChecked, items, "id");
		  items = items.slice(Math.min(start, end), Math.max(start, end) + 1);
		  selectedItems.push(
			...items.map(item => {
			  return item.id;
			})
		  );
		  selectedItems = Array.from(new Set(selectedItems));
		  this.setState({
			selectedItems
		  });
		}
		document.activeElement.blur();
	  }
  
	  changeOrderBy = (orderBy) => {
		  if(this.state.search.length > 0 ){
			database.collection('USERS').where('email', '>', this.state.search).orderBy(orderBy, 'desc').get().then(res => {
				this.setState({
					users: res.docs
				})
			})
		  }else{
			database.collection('USERS').orderBy(orderBy, 'desc').get().then(res => {
				this.setState({
					users: res.docs
				})
			})
		  }
		
	  }
	handleChangeSelectAll(isToggle) {
		if (this.state.selectedItems.length >= this.state.users.length) {
		  if (isToggle) {
			this.setState({
			  selectedItems: []
			});
		  }
		} else {
		  this.setState({
			selectedItems: this.state.users.map(x => x.id)
		  });
		}
		document.activeElement.blur();
		return false;
	  }

	toggleModal = () => {
		this.setState({
			modalOpen: !this.state.modalOpen
		});
	}

	hold = (action) =>{
		const { selectedItems } = this.state
		let count = 0
		selectedItems.map(item => {
			count ++
			database.collection('USERS').doc(item).update({ active: action }).then(res => {
				if(count === selectedItems.length){
					database.collection('USERS').get().then(res => {
						this.setState({
							users: res.docs
						})
					})
				}
			})
		})

	}

	render() {
		return (
			<Fragment>
				<div className="disable-text-selection">
					<Row>
						<Colxx xxs="12">
							<div className="mb-2">
								<h1>
									Usuarios
								</h1>

								<div className="float-sm-right">
									{/* <Button
										color="primary"
										size="lg"
										className="top-right-button"
										onClick={this.toggleModal}
									>
										Nuevo
									</Button>
									{"  "} */}

									<Modal
										isOpen={this.state.modalOpen}
										toggle={this.toggleModal}
										wrapClassName="modal-right"
										backdrop="static"
									>
										<ModalHeader toggle={this.toggleModal}>
											<IntlMessages id="layouts.add-new-modal-title" />
										</ModalHeader>
										<ModalBody>
											<Label>
												<IntlMessages id="layouts.product-name" />
											</Label>
											<Input />
											<Label className="mt-4">
												<IntlMessages id="layouts.category" />
											</Label>
											<Select
												components={{ Input: CustomSelectInput }}
												className="react-select"
												classNamePrefix="react-select"
												name="form-field-name"
												options={this.state.categories}
											/>
											<Label className="mt-4">
												<IntlMessages id="layouts.description" />
											</Label>
											<Input type="textarea" name="text" id="exampleText" />
											<Label className="mt-4">
												<IntlMessages id="layouts.status" />
											</Label>
											<CustomInput
												type="radio"
												id="exCustomRadio"
												name="customRadio"
												label="ON HOLD"
											/>
											<CustomInput
												type="radio"
												id="exCustomRadio2"
												name="customRadio"
												label="PROCESSED"
											/>
										</ModalBody>
										<ModalFooter>
											<Button
												color="secondary"
												outline
												onClick={this.toggleModal}
											>
												<IntlMessages id="layouts.cancel" />
											</Button>
											<Button color="primary" onClick={this.toggleModal}>
												<IntlMessages id="layouts.submit" />
											</Button>{" "}
										</ModalFooter>
									</Modal>
									<ButtonDropdown
										isOpen={this.state.dropdownSplitOpen}
										toggle={this.toggleSplit}
									>


										<div className="btn btn-primary pl-4 pr-0 check-button">
											<Label
												for="checkAll"
												className="custom-control custom-checkbox mb-0 d-inline-block"
											>
												<Input
						  className="custom-control-input"
						  type="checkbox"
						  id="checkAll"
						  checked={
							this.state.selectedItems.length >=
							this.state.users.length
						  }
						  onClick={() => this.handleChangeSelectAll(true)}
						/>
												<span
													className={`custom-control-label ${
														this.state.selectedItems.length > 0 &&
															this.state.selectedItems.length <
															this.state.users.length
															? "indeterminate"
															: ""
														}`}
												/>
											</Label>
										</div>
										<DropdownToggle
											caret
											color="primary"
											className="dropdown-toggle-split pl-2 pr-2"
										/>
										<DropdownMenu right>
											<DropdownItem
											onClick={ () => this.hold(false) }
											>
												Bloquear
											</DropdownItem>
											<DropdownItem
											onClick={ () => this.hold(true) }
											>
												Activar
											</DropdownItem>
										</DropdownMenu>
										
										
									
									</ButtonDropdown>
								</div>

								{/* <BreadcrumbItems match={this.props.match} /> */}
							</div>

							<div className="mb-2">
								<Button
									color="empty"
									className="pt-0 pl-0 d-inline-block d-md-none"
									onClick={this.toggleDisplayOptions}
								>
									<IntlMessages id="layouts.display-options" />{" "}
									<i className="simple-icon-arrow-down align-middle" />
								</Button>
								<Collapse
									isOpen={this.state.displayOptionsIsOpen}
									className="d-md-block"
									id="displayOptions"
								>

									<div className="d-block d-md-inline-block">
										<UncontrolledDropdown className="mr-1 float-md-left btn-group mb-1">
											<DropdownToggle caret color="outline-dark" size="xs">
												Ordernar por
						{this.state.selectedOrderOption.label}
											</DropdownToggle>
											<DropdownMenu>
												{this.state.orderOptions.map((order, index) => {
													return (
														<DropdownItem
															key={index}
															onClick={() => this.changeOrderBy(order.column)}
														>
															{order.label}
														</DropdownItem>
													);
												})}
											</DropdownMenu>
										</UncontrolledDropdown>
										<div className="search-sm d-inline-block float-md-left mr-1 mb-1 align-top">
											<input
												type="text"
												name="keyword"
												id="search"
												placeholder='Buscar'
												onChange={e => this.handleKeyPress(e)}
											/>
										</div>
									</div>
								</Collapse>
							</div>
							<Separator className="mb-5" />
						</Colxx>
					</Row>
					<Row>
						{
							this.state.users.map(user => {
								const creation = moment(user.data().creationTime);
								return (
									<Colxx xxs="12" key={user.id} className="mb-3">
										<ContextMenuTrigger
											id="menu_id"
											data={user.id}
										//collect={collect}
										>
											<Card
												onClick={event =>
													this.handleCheckChange(event, user.id)
												}
												className={classnames("d-flex flex-row", {
													active: this.state.selectedItems.includes(
														user.id
													)
												})}
											>

												<div className="pl-2 d-flex flex-grow-1 min-width-zero">
													<div className="card-body align-self-center d-flex flex-column flex-lg-row justify-content-between min-width-zero align-items-lg-center">
														<NavLink
															to={`?p=${user.id}`}
															className="w-40 w-sm-100"
														>
															<p className="list-item-heading mb-1 truncate">
																{user.data().email}
															</p>
														</NavLink>
														<p className="mb-1 text-muted text-small w-15 w-sm-100">
															{creation.format("DD/MM/YY")}
														</p>
														<div className="w-15 w-sm-100 user">
															 <Badge className={ user.data().active ? 'active' : 'hold' } pill>
																{user.data().active ? 'ACTIVO' : 'INACTIVO'}
															</Badge> 
														</div>
													</div>
												</div>
												<div className="custom-control custom-checkbox pl-1 align-self-center pr-4">
							<CustomInput
							  className="itemCheck mb-0"
							  type="checkbox"
							  id={`check_${user.id}`}
							  checked={this.state.selectedItems.includes(
								user.id
							  )}
							  onChange={() => {}}
							  label=""
							/>
						  </div>

											</Card>
										</ContextMenuTrigger>
									</Colxx>
								)
							})
						}
						{/* {this.state.items.map(product => {

				return (
				  <Colxx xxs="12" key={product.id} className="mb-3">
					<ContextMenuTrigger
					  id="menu_id"
					  data={product.id}
					  collect={collect}
					>
					  <Card
						onClick={event =>
						  this.handleCheckChange(event, product.id)
						}
						className={classnames("d-flex flex-row", {
						  active: this.state.selectedItems.includes(
							product.id
						  )
						})}
					  >
						<div className="pl-2 d-flex flex-grow-1 min-width-zero">
						  <div className="card-body align-self-center d-flex flex-column flex-lg-row justify-content-between min-width-zero align-items-lg-center">
							<NavLink
							  to={`?p=${product.id}`}
							  className="w-40 w-sm-100"
							>
							  <p className="list-item-heading mb-1 truncate">
								{product.title}
							  </p>
							</NavLink>
							<p className="mb-1 text-muted text-small w-15 w-sm-100">
							  {product.category}
							</p>
							<p className="mb-1 text-muted text-small w-15 w-sm-100">
							  {product.date}
							</p>
							<div className="w-15 w-sm-100">
							  <Badge color={product.statusColor} pill>
								{product.status}
							  </Badge>
							</div>
						  </div>
						  <div className="custom-control custom-checkbox pl-1 align-self-center pr-4">
							<CustomInput
							  className="itemCheck mb-0"
							  type="checkbox"
							  id={`check_${product.id}`}
							  checked={this.state.selectedItems.includes(
								product.id
							  )}
							  onChange={() => {}}
							  label=""
							/>
						  </div>
						</div>
					  </Card>
					</ContextMenuTrigger>
				  </Colxx>
				);
			  }
			})} */}
						<Pagination
							currentPage={this.state.currentPage}
							totalPage={this.state.totalPage}
							onChangePage={i => this.onChangePage(i)}
						/>
					</Row>
				</div>
				<ContextMenu
					id="menu_id"
					onShow={e => this.onContextMenu(e, e.detail.data)}
				>
					<MenuItem
						onClick={this.onContextMenuClick}
						data={{ action: "copy" }}
					>
						<i className="simple-icon-docs" /> <span>Copy</span>
					</MenuItem>
					<MenuItem
						onClick={this.onContextMenuClick}
						data={{ action: "move" }}
					>
						<i className="simple-icon-drawer" /> <span>Move to archive</span>
					</MenuItem>
					<MenuItem
						onClick={this.onContextMenuClick}
						data={{ action: "delete" }}
					>
						<i className="simple-icon-trash" /> <span>Delete</span>
					</MenuItem>
				</ContextMenu>
			</Fragment>
		);
	}
}
