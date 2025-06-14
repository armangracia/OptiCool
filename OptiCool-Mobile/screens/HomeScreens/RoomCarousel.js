import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const RoomCarousel = () => {
    const navigation = useNavigation();
    const [isOnline, setIsOnline] = useState(false);

    const rooms = [
        { id: '1', image: require('../../assets/DMTRoom2.jpg'), screen: 'DMTRoom' },
        { id: '2', image: require('../../assets/DMTRoom.jpg'), screen: 'Classroom1Screen' },
        { id: '3', image: require('../../assets/DMTRoom1.jpg'), screen: 'Classroom2Screen' },
        { id: '4', image: require('../../assets/DMTRoom.jpg'), screen: 'Classroom1Screen' }
    ];

    useEffect(() => {
        const checkSite = async () => {
            try {
                const res = await axios.get('https://notable-complete-garfish.ngrok-free.app', { timeout: 5000 });
                setIsOnline(res.status === 200);
            } catch (error) {
                setIsOnline(false);
            }
        };
        checkSite();
        const interval = setInterval(checkSite, 10000); // check every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate(item.screen)} style={styles.itemContainer}>
            <Image source={item.image} style={styles.image} />
            <View style={styles.statusContainer}>
                <View style={[
                    styles.circle,
                    { backgroundColor: isOnline ? 'green' : 'red' }
                ]} />
                <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.wrapper}>
            <Text style={styles.roomText}>Room</Text>
            <View style={styles.container}>
                <FlatList
                    data={rooms}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.flatListContainer}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        paddingHorizontal: 10,
        marginTop: 25,
    },
    roomText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4f5e70',
        marginBottom: 10,
        marginLeft: 15,
    },
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    flatListContainer: {
        paddingHorizontal: 10,
    },
    itemContainer: {
        marginHorizontal: 10,
        alignItems: 'center',
    },
    image: {
        width: 250,
        height: 190,
        borderRadius: 10,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 20,
        alignSelf: 'center',
        marginTop: 0,
        paddingHorizontal: 15,
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    circle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 5,
    },
    statusText: {
        fontWeight: 'bold',
        color: 'black',
    },
});

export default RoomCarousel;
