import React, { Component, Fragment } from "react";
import { GeoFirestore } from 'geofirestore'

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
import Switch from "react-switch";

import PlacesAutocomplete, {
	geocodeByPlaceId,
	getLatLng,
	geocodeByAddress
} from 'react-places-autocomplete';
import Select from "react-select";
import { NavLink } from "react-router-dom";
import AutoComplete from '../../../components/AutoComplete'
import CustomSelectInput from "Components/CustomSelectInput";

import { Colxx, Separator } from "Components/CustomBootstrap";
import BreadcrumbContainer from "Components/BreadcrumbContainer";
import Pagination from "Components/List/Pagination";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import { database, firebaseApp as firebase } from "../../../firebase";
import classnames from "classnames";
import moment from "moment";
import './styles.css'
import InputAC from '../../../components/InputAC'



const searchOptions = {
	componentRestrictions: {
		country: 'es'
	}
}



export default class extends Component {
	state = {
		displayMode: "list",
		pageSizes: [10, 20, 30, 50, 100],
		selectedPageSize: 10,
		categories: [
			{ label: '', value: '', key: 0 },
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
		shops: [],
		nameSelected: '',
		address: '',
		autocomplete: false,
		name: '',
		postal_code: '',
		locality: '',
		administrative_area_level_2: '',
		administrative_area_level_1: '',
		geometry: {},
		predictions: [],
		formatted_address: '',
		website: '',
		place_id: '',
		formatted_phone_number: '',
		country: '',
		route: '',
		token: '',
		icon: '',
		email: '',
		user: '',
		password: '',
		active: true,
		street_number: '',
		keyword: '',
		data: [],
	};

	componentDidMount = () => {
		let cats = []
		database.collection('CATEGORIES').get().then(categories => {
			categories.docs.map((item, index) => {
				cats.push({
					...item.data(),
					label: item.data().name,
					value: item.id,
					key: item.id,
					id: item.id
				})

			})
			this.setState({
				categories: cats
			})
			this.getdata()
		})

	}

	getdata = async () => {
		let offerts = []
		await database.collection('OFFERTS').get().then(offert => {
			let count = 0
			offert.forEach(async (item) => {
				count++
				await database.collection('LOCALS').doc(item.data().place_id).get().then(res => {
					offerts.push({
						shop: res.data().name,
						...item.data(),
						id: item.id

					})
					if (count === offert.size) {
						this.setState({
							data: offerts
						})
					}


				})
			})


		})


	}

	toggleSplit = () => {
		this.setState(prevState => ({
			dropdownSplitOpen: !prevState.dropdownSplitOpen
		}));
	}


	handleChangeName = (el) => {

		this.setState({
			name: el.target.value
		}, () => {
			this.props.getPredictions(this.state.name, this.state.token)
		}
		)

	}

	handleBlurCloseAutoComplete = (el) => {
		this.setState({
			autocomplete: false
		})

	}
	handleFocusAutoComplete = () => {
		this.setState({
			autocomplete: true
		})

	}

	handleClickSubmit = () => {




		const place = {

			user: this.state.user,
			password: this.state.password,
			email: this.state.email,
			route: this.state.route,
			country: this.state.country,
			locality: this.state.locality,
			administrative_area_level_1: this.state.administrative_area_level_1,
			active: this.state.active,
			administrative_area_level_2: this.state.administrative_area_level_2,
			geometry: this.state.geometry,
			website: this.state.website,
			formatted_address: this.state.formatted_address,
			formatted_phone_number: this.state.formatted_phone_number,
			place_id: this.state.place_id,
			postal_code: this.state.postal_code,
			name: this.state.name,
			street_number: this.state.street_number,
			keyword: this.state.keyword,
			email: this.state.email

		}
		let validatefield = true
		for (var i in place) {
			console.log()
			if (place[i].length === 0) {
				alert('Rellene los campos vacios')
				validatefield = false;
				break
			}
		}

		if (validatefield) {
			this.shopCreate(place)
		}


	}

	shopCreate = async (place) => {

		const geoFirestore = new GeoFirestore(database.collection('LOCALS'));
		const {
			active,
			administrative_area_level_1,
			administrative_area_level_2,
			country,
			email,
			geometry,
			formatted_address,
			formatted_phone_number,
			locality,
			name,
			password,
			place_id,
			postal_code,
			route,
			street_number,
			user,

		} = place

		let res = false
		const timestamp = firebase.firestore.FieldValue.serverTimestamp()
		console.log(place_id)
		const ref = await database.collection("LOCALS")
		const exist = await ref.get().then(res => console.log(res.exists))
		console.log(place_id)
		await geoFirestore.set(place_id, {
			coordinates: new firebase.firestore.GeoPoint(geometry.location.lat(), geometry.location.lng())
		})
			.then(async () => {
				await ref.doc(place_id).update({
					active,
					administrative_area_level_1,
					administrative_area_level_2,
					country,
					email,
					formatted_address,
					formatted_phone_number,
					locality,
					name,
					password,
					place_id,
					postal_code,
					route,
					street_number,
					user,
					errollment: timestamp,
					modify: timestamp
				})
					.then((response) => {
						this.getShops()
						this.toggleModal()

					})
			})
		// if (exist) {


		// } else {
		//     await ref.set({
		//         active,
		//         administrative_area_level_1,
		//         administrative_area_level_2,
		//         country,
		//         email,
		//         formatted_address,
		//         formatted_phone_number,
		//         icon,
		//         locality,
		//         name,
		//         password,
		//         place_id,
		//         postal_code,
		//         route,
		//         street_number,
		//         user,
		//         errollment: timestamp,
		//         modify: timestamp
		//     })
		//         .then((docRef) => {
		//             geoFirestore.add({ 
		//                 coordinates: new firebase.firestore.GeoPoint(geometry.location.lat(), geometry.location.lng())
		//             }, place_id)
		//             .then((docRef) => {
		//             	console.log('success'); // ID of newly added document
		//               }, (error) => {
		//             	console.log('Error: ' + error);
		//               });
		//             res = true
		//         })
		//         .catch(function (error) {
		//             res = false
		//             console.error("Error adding document: ", error);
		//         });
		//}

	}






	onClickCapture = (el) => {
		let result = false
		el.path.map(i => {
			if (i.id === 'autocomplete') {
				result = true
			}
			return true
		})
		if (!result) {
			this.handleBlurCloseAutoComplete()
		}

	}

	handelClickCapture = (el) => {
	}



	handleSelectLocal = (el) => {

		//getPlaceById()
	}

	handleSelectClick = async (item) => {

		const { placeId } = item
		const name = item.formattedSuggestion.mainText
		this.setState({
			selected: true
		})


		const place = await geocodeByPlaceId(placeId)
			.then(results => {
				console.log(results, 'asds')
				return results[0]

			})
			.catch(error => console.error(error));
		// const place = await getPlaceById(id)
		const {
			formatted_address,
			formatted_phone_number,
			geometry,
			icon,
			place_id,
			website,
			address_components,
		} = place

		address_components.map(item => {
			this.setState({
				[item.types[0]]: item.long_name
			})
			return true
		})
		const nom = name.replace(' ', '')
		const randomNumber = Math.floor(Math.random() * (100 - 0)) + 0
		const password = Math.floor(Math.random() * (1000 - 0)) + 0
		const user = nom.slice(0, 6) + randomNumber.toString()
		this.setState({
			user,
			password,
			name: name,
			autocomplete: false,
			place_id,
			geometry,
			formatted_address: formatted_address ? formatted_address : '',
			formatted_phone_number: formatted_phone_number ? formatted_phone_number : '',
			icon: icon ? icon : '',
			website: website ? website : ''

		})



	}

	handleChangeChecked = () => { this.setState({ active: !this.state.active }) }

	handleChangeInput = (el) => {

		this.setState({
			[el.target.name]: el.target.value
		})
	}

	handleClickClose = () => {
		this.props.history.goBack()
	}


	handleChange = name => {
		this.setState({
			name: name,
			autocomplete: true
		});
	};

	handleSelect = address => {
		// geocodeByAddress(address)
		//     .then(results => getLatLng(results[0]))
		//     .then(latLng => console.log('Success', latLng))
		//     .catch(error => console.error('Error', error));
	};
	onContextMenuClick = (e, data, target) => {
		console.log("onContextMenuClick - selected items", this.state.selectedItems)
		console.log("onContextMenuClick - action : ", data.action);
	};

	onContextMenu = (e, data) => {
		const clickedProductId = data.data;
		if (!this.state.selectedItems.includes(clickedProductId)) {
			this.setState({
				selectedItems: [clickedProductId]
			});
		}

		return true;
	};

	handleKeyPress = (e) => {
		this.setState({
			search: e.target.value
		})

		if (e.target.value.length === 0) {
			database.collection('USERS').get().then(res => {
				this.setState({
					users: res.docs
				})
			})
		} else {
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
		if (this.state.search.length > 0) {
			database.collection('USERS').where('email', '>', this.state.search).orderBy(orderBy, 'desc').get().then(res => {
				this.setState({
					users: res.docs
				})
			})
		} else {
			database.collection('USERS').orderBy(orderBy, 'desc').get().then(res => {
				this.setState({
					users: res.docs
				})
			})
		}

	}
	handleChangeSelectAll(isToggle) {
		if (this.state.selectedItems.length >= this.state.shops.length) {
			if (isToggle) {
				this.setState({
					selectedItems: []
				});
			}
		} else {
			this.setState({
				selectedItems: this.state.shops.map(x => x.item.id)
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

	hold = (action) => {
		const { selectedItems } = this.state
		let count = 0
		selectedItems.map(item => {

			count++
			database.collection('LOCALS').doc(item).update({ active: action }).then(res => {
				if (count === selectedItems.length) {
					this.getShops()
				}
			})
		})

	}

	getIconCategory = (id) => {
		const category = this.state.categories.filter(item => item.id === id)
		return  category[0].icon
	}

	getNameCategory = (id) => {
		const category = this.state.categories.filter(item => item.id === id)

		return  category[0].name
	}

	render() {
		const { categories, data } = this.state
		return (
			<Fragment>
				<div className="disable-text-selection">
					<Row>
						<Colxx xxs="12">
							<div className="mb-2">
								<h1>
									Ofertas
								</h1>

								<div className="float-sm-right">
									<Button
										color="primary"
										size="lg"
										className="top-right-button"
										onClick={this.toggleModal}
									>
										Nuevo
									</Button>
									{"  "}

									<Modal
										isOpen={this.state.modalOpen}
										toggle={this.toggleModal}
										wrapClassName="modal-right"
										backdrop="static"
									>
										<ModalHeader toggle={this.toggleModal}>
											Nueva oferta
										</ModalHeader>
										<ModalBody>

											<Label>
												Categoria
												</Label>
											<Select
												components={{ Input: CustomSelectInput }}
												className="react-select"
												classNamePrefix="react-select"
												name="form-field-name"
												options={this.state.categories}
											/>
											<Label className="mt-4">
												Descripción
											</Label>
											<Input type="textarea" name="text" id="exampleText" />
											<Label className="mt-4">
												Precio (€)
											</Label>
											<Input type="text" name="price" value={this.state.price} />
											<Label className="mt-4">
												Activo
											</Label>
											<div>
												<Switch
													onChange={this.handleChangeChecked}
													checked={this.state.active}
													id="normal-switch"
												/>

											</div>
										</ModalBody>
										<ModalFooter>
											<Button
												color="secondary"
												outline
												onClick={this.toggleModal}
											>
												Cancelar
											</Button>
											<Button color="primary" onClick={this.handleClickSubmit}>
												Guardar
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
														this.state.shops.length
													}
													onClick={() => this.handleChangeSelectAll(true)}
												/>
												<span
													className={`custom-control-label ${
														this.state.selectedItems.length > 0 &&
															this.state.selectedItems.length <
															this.state.shops.length
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
												onClick={() => this.hold(false)}
											>
												Bloquear
											</DropdownItem>
											<DropdownItem
												onClick={() => this.hold(true)}
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
							data.map(item => {
								console.log(item.id)
								return (
									<Colxx xxs="12" key={item.id} className="mb-3">
										<ContextMenuTrigger
											id="menu_id"
											data={item.id}
										//collect={collect}
										>
											<Card
												onClick={event =>
													this.handleCheckChange(event, item.id)
												}
												className={classnames("d-flex flex-row", {
													active: this.state.selectedItems.includes(
														item.id
													)
												})}
											>

												<div className="pl-2 d-flex flex-grow-1 min-width-zero">
													<div className="card-body align-self-center d-flex flex-column flex-lg-row justify-content-between min-width-zero align-items-lg-center">
														<NavLink
															to={`?p=${item.id}`}
															className="w-40 w-sm-100"
														>
														
															<p className="list-item-heading mb-1 truncate">
															<img style={{width: '40px', height: '40px', marginRight: 10}} src={this.getIconCategory(item.category)}
															className="list-thumbnail border-0"/>
																{item.title}
															</p>
														</NavLink>
					
														<p className="mb-1 text-muted text-small w-15 w-sm-100">
														{item.price}€
														</p>
														<p className="mb-1 text-muted text-small w-15 w-sm-100">
														{this.getNameCategory(item.category)}
														</p>
														<div className="w-15 w-sm-100 user">
															<Badge className={item.active ? 'active' : 'hold'} pill>
																{item.active ? 'ACTIVO' : 'INACTIVO'}
															</Badge>
														</div>
													</div>
												</div>
												<div className="custom-control custom-checkbox pl-1 align-self-center pr-4">
													<CustomInput
														className="itemCheck mb-0"
														type="checkbox"
														id={`check_${item.id}`}
														checked={this.state.selectedItems.includes(
															item.id
														)}
														onChange={() => { }}
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
